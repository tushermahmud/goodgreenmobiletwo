import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@awesome-cordova-plugins/file-transfer/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@awesome-cordova-plugins/streaming-media/ngx';
import { ActionSheetController, AlertController, IonicModule } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { take, takeLast } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { JobDetailsRes, JobMedia } from 'src/app/models/job-details.model';


@Component({
	standalone: true,
	selector: 'app-job-media',
	templateUrl: './job-media.component.html',
	styleUrls: ['./job-media.component.css'],
	imports: [
		CommonModule,
		IonicModule,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JobMediaComponent implements OnInit {
	@Input() jobMedia: JobMedia;
	@Input() jobMeta: JobDetailsRes;
	@Input() type : string;

	@Output() onRefreshMediaHandler = new EventEmitter(false);

	private streamingMediaOptions: StreamingVideoOptions = {
		successCallback: () => {
			console.log('Video played');
		},
		errorCallback: (e) => {
			console.log(JSON.stringify(e));
		},
		// orientation: 'landscape',
		shouldAutoClose: false,
		controls: true,
	};

	jobCardId: number;
	jobId: number;
	baId: string;
	accountId: number;
	loginUserBusinessData: any;
	selectedTag: any
	medias:any
	uploadInprogress: boolean = false;
	jobMedias=[];
	jobCardMedias=[];

	subscription: Subscription = null
	constructor(
		private mediaService: MediaUploadService,
		private leadHelperService: LeadHelperService,
		private storageService: StorageService,
		private fileTransfer: FileTransfer,
		private loaderService: IonLoaderService,
		private commonService: CommonService,
		private cd: ChangeDetectorRef,
		private photoViewer: PhotoViewer,
		private mediaStreaming: MediaStreamingService,
		private actionSheetCtrl: ActionSheetController,
		private alertController: AlertController
	) { }

	ngOnInit(): void {
		this.commonService.refreshMediaObs$.subscribe(async (data) => {
			if (data) {
				this.jobMedia = this.jobMedia;
				// this.cd.detectChanges();
			}
		});
		console.log('jobMedia', this.jobMedia);
		console.log('type',this.type)
		this.jobMedias=[...this.jobMedia?.jobMedia]
		this.jobCardMedias=[...this.jobMedia?.jobCardMedia]
		this.jobCardId = this.jobMeta.jobDetails.jobCard.id;
		this.jobId = this.jobMeta.jobDetails.job.id;

		this.storageService.getAuthData().then(data => {
			this.loginUserBusinessData = data;
			this.baId = this.loginUserBusinessData.employee.businessAccountId;
			this.accountId = this.loginUserBusinessData.employee.accountId;


			console.log('this.authData', this.loginUserBusinessData);
			console.log('this.authData', this.baId);

		})

		this.subscription = this.mediaService.triggerUploadObs$.subscribe((data) => {
			console.log('OBS STREAM',data);
			this.selectedTag = data?.tag;
			if(this.mediaService.isMediaUploadInProgress) return;
			if (data.upload && data.componentName === this.constructor.name && this.mediaService.mediaList.length > 0) {
				// this.mediaService.triggerUpload.next(false);
				
				if (this.mediaService.mediaList[0].type.includes('image')) {
					this.uploadImageToS3(this.mediaService.mediaList[0]);
				} else {
					this.uploadVideoToS3(this.mediaService.mediaList[0]);
				}
			}
		})

	}


	async presentActionSheet(i,tag:string) {
		if(tag === 'job-card-start' || tag === 'job-card-end'){
			this.medias = this.jobCardMedias
		}
		else{
			this.medias = this.jobMedias
		}
		const actionSheet = await this.actionSheetCtrl.create({
			cssClass: 'c-action-sheet',
			buttons: [
				{
					text: `${this.medias[i]?.fileType.includes('image') ? 'View' : 'Play'
						}`,
					role: 'open',
					data: {
						action: 'open',
					},
					handler: () => {
						console.log('Open clicked');
						this.playMedia(i);
					},
				},
				{
					text: 'Delete',
					icon: 'trash-bin-outline',
					role: 'destructive',
					data: {
						action: 'delete',
					},
					handler: () => {
						console.log('Delete clicked');
						this.deleteMedia(i);
					},
				},
				{
					text: 'Cancel',
					icon: 'close',
					role: 'cancel',
					data: {
						action: 'cancel',
					},
				},
			],
		});

		await actionSheet.present();

		const result = await actionSheet.onDidDismiss();
		// this.result = JSON.stringify(result, null, 2);
		console.log('result', result);
	}

	async uploadMedia(selectedAccordianTag?: any) {
		// if (selectedAccordianTag) {
		// 	// this.selectedTag = selectedAccordianTag['key'];
		// }
		// this.selectedTag = 'job'
		await this.mediaService.selectAndUploadMediaFromGallery( this.constructor.name ,true, null);
	}

	/**
	 * Using cordova file transfer plugin 
	 *
	 * @param image
	 */
	async uploadImageToS3(image) {
		this.uploadInprogress = true;
		await this.loaderService.dismissLoading();

		this.mediaService.isMediaUploadInProgress = true;
		await this.loaderService.createLoading('Uploading image...')
		console.log('uploading image file:', image);
		const payload = {
			fileTitle: image.name,
		};

		this.leadHelperService.uploadStartOrEndJobMedia(this.baId, 'job', this.jobCardId, payload)
			.subscribe({
				next: async (uploadLocationData) => {
					console.log('uploadLocationData', uploadLocationData);
					const contentType = { 'Content-Type': image.type };
					const fileTransfer = this.fileTransfer.create();
					const options: FileUploadOptions = {
						httpMethod: uploadLocationData[0].httpMethod,
						headers: contentType,
						mimeType: image.type,
						chunkedMode: false,
					};
					let fileUrl = null;
					let thumbnailUrl = null;

					uploadLocationData.forEach((loc) => {
						loc.type == 'thumbnail'
							? (thumbnailUrl = loc.accessLink)
							: (fileUrl = loc.accessLink);
					});

					await fileTransfer.upload(image.fullPath, uploadLocationData[0].uploadUrl, options)
						.then(
							async (result) => {
								console.log('fileTransfer RESPONSE', result);

								// inform backend that upload is success and pass the uploaded s3 location
								const payload = {
									accessLink: uploadLocationData[0].accessLink,
									fileType: 'image',
									thumbnailUrl: uploadLocationData[0].accessLink,
									referenceId: uploadLocationData[0].referenceId,
									tag: !this.selectedTag ? 'job' : this.selectedTag,
									uploadedByAcc: this.accountId
								};

								//call inform backend api and empty the selectedTag var
								this.leadHelperService.saveJobMedia(this.baId, this.accountId, this.jobCardId, this.jobId, payload).subscribe({
									next: async (saveRes) => {
										console.log('saveRes', saveRes);
										// let newMedia = {
										// 	accessLink: fileUrl,
										// 	fileType: 'image',
										// 	thumbnail: fileUrl,
										// 	serviceRequestId: this.jobCardId,
										// 	referenceId: uploadLocationData[0].referenceId,
										// };
										// this.jobMedia.push(newMedia);
										// this.jobMedia = [...this.jobMedia]
										// this.emitRefresh.emit(true);
										
										console.log('this.medias', this.jobMedia);
										this.mediaService.mediaList = [];
										await this.loaderService.dismissLoading();
										this.mediaService.isMediaUploadInProgress = false;
										this.uploadInprogress = false;
										await this.commonService.showToast('Media uploaded successfully');
										// this.commonService.refreshJobDetails.next(true);
										// this.jobMedia.jobCardMedia = [...this.jobMedia.jobCardMedia]
										this.onRefreshMediaHandler.emit(true);
										this.cd.detectChanges();

									},
									error: async (err) => {
										console.log('err', err);
										await this.loaderService.dismissLoading();
										await this.commonService.showToast('Failed to upload media, please try again.');
									}
								});
								// await this.loaderService.dismissLoading();
							},
							async (err) => {
								console.log(
									`media file upload failed: ${uploadLocationData[0].type}`,
									image.fullPath,
									JSON.stringify(err)
								);
								await this.commonService.showToast('Error while uploaing media, please try again.');
								await this.loaderService.dismissLoading();
							}
						);
				},
				error: async (err) => {
					console.log('err', err);
					await this.loaderService.dismissLoading();
					await this.commonService.showToast('Error while generating upload location for media, please try again.');
				},
				complete: () => {
					console.log('Upload is done ');
				},
			});
	}

	async uploadVideoToS3(video) {
		this.uploadInprogress = true;
		await this.loaderService.dismissLoading();
		this.mediaService.isMediaUploadInProgress = true;
		await this.loaderService.createLoading('Uploading video...')
		console.log('uploading video and thumbnail files:', video.fullPath);
		const payload = {
			fileTitle: video.name,
			thumbnailTitle: video.thumbnailName,
		};
		let thumbnailLocation;
		this.leadHelperService
			.uploadStartOrEndJobMedia(
				this.baId,
				'job',
				this.jobCardId,
				payload
			)
			.subscribe({
				next: async (uploadLocationData) => {
					if (uploadLocationData) {
						console.log('VIDEO', uploadLocationData);

						uploadLocationData.forEach(async (location) => {
							let uploadFile;
							let contentType;
							let mimeType;
							console.log('EACH LOCATION', location);

							thumbnailLocation = location.type === 'thumbnail' ? location.accessLink : null;
							uploadFile = location.type === 'thumbnail' ? video.thumbnailFile : video.fullPath;
							contentType = location.type === 'thumbnail' ? { 'Content-Type': 'image/jpeg' } : { 'Content-Type': video.type };
							mimeType = location.type === 'thumbnail' ? 'image/jpeg' : video.type; // thumbnail file

							const fileTransfer: FileTransferObject = this.fileTransfer.create();
							const options: FileUploadOptions = {
								httpMethod: location.httpMethod,
								headers: contentType,
								mimeType,
								chunkedMode: false,
							};

							await fileTransfer
								.upload(uploadFile, location.uploadUrl, options)
								.then(
									async (result) => {
										await this.loaderService.dismissLoading();
										this.commonService.showToast(
											'Media is uploaded successfully.'
										);
										// this.commonService.refreshJobDetails.next(true);
										
										this.onRefreshMediaHandler.emit(true);
										console.log(JSON.stringify(result));
										// this.jobMedia.jobCardMedia = [...this.jobMedia.jobCardMedia]
										let fileUrl = null;
										
										let thumbnailUrl = null;

										if (location.type == 'image/video') {
											fileUrl = location.accessLink;
										} else if (location.type == 'thumbnail') {
											thumbnailUrl = location.accessLink;
										}

										if (location.type !== 'thumbnail') {
											const payload = {
												accessLink: location.accessLink,
												fileType: 'video',
												thumbnailUrl: thumbnailLocation,
												referenceId: location.referenceId,
												uploadedByAcc: this.accountId,
												tag:!this.selectedTag ? 'job' : this.selectedTag
											};

											this.leadHelperService.saveJobMedia(this.baId, this.accountId, this.jobCardId, this.jobId, payload).subscribe({
												next: async (saveRes) => {
													console.log('saveRes', saveRes);
													if (saveRes) {
														let newMedia = {
															accessLink: location.accessLink,
															fileType: 'video',
															thumbnail: thumbnailLocation,
															serviceRequestId: this.jobCardId,
															referenceId: location.referenceId,
															uploadedByAcc: this.accountId
														};
														// this.jobMedia.push(newMedia);
														// this.jobMedia = [...this.jobMedia]
													}
													this.cd.detectChanges();
													this.jobMedia.jobCardMedia = [...this.jobMedia.jobCardMedia]
													this.mediaService.mediaList = [];
													await this.loaderService.dismissLoading();
													this.uploadInprogress = false;
													this.mediaService.isMediaUploadInProgress = false;
													this.commonService.showToast(
														'Media is uploaded successfully.'
													);
												},
												error: async (err) => {
													console.log('err', err);
													await this.loaderService.dismissLoading();
												}
											});
										}
									},
									(err) => {
										console.log(
											`media file upload failed: ${location.type}`,
											uploadFile,
											JSON.stringify(err)
										);
									}
								);

							
						});
					}
				},
				error:async (err) => {
					console.log('err', err);
					await this.loaderService.dismissLoading();
				},
				complete: () => {
					console.log('Upload is done ');
				},
			});
	}

	playMedia(mediaIndex) {

		this.mediaStreaming.playMedia(this.medias, mediaIndex)
	}

	ngOnDestroy(): void {
		//Called once, before the instance is destroyed.
		//Add 'implements OnDestroy' to the class.
		this.subscription.unsubscribe();
	}


	  async deleteMedia(i) {
		let selectedMedia = this.medias[i];
		let msg = `Are you sure you want to delete this ${
		  selectedMedia?.fileType.includes('image') ? 'Image' : 'Video'
		}?`;
		const alert = await this.alertController.create({
		  header: msg,
		  buttons: [
			{
			  text: 'No',
			  role: 'cancel',
			  handler: () => {
				console.log('Alert canceled');
			  },
			},
			{
			  text: 'Yes',
			  role: 'confirm',
			  handler: () => {
				console.log('Alert confirmed');
				this.delete(selectedMedia);
			  },
			},
		  ],
		});
	
		await alert.present();
	
		const { role } = await alert.onDidDismiss();
		console.log(`Dismissed with role: ${role}`);
	  }
	

	delete(media) {
		let mediaId = media?.id
		this.leadHelperService.deleteJobMedia(this.baId, this.accountId, this.jobCardId, this.jobId, mediaId).subscribe({
			next: data => {
				console.log("data", data);
				if (data) {
					this.medias = this.medias.filter(
						(x) => x.id !== mediaId
					);
					if (media?.tag === 'job-card-start' || media?.tag === 'job-card-end') {
						this.jobCardMedias = [...this.medias]
					}
					else {
						this.jobMedias = [...this.medias]
					}
					this.commonService.showToast(
						'Media is deleted successfully.'
					);
					// this.onRefreshMediaHandler.emit(true);
				}
			},
			error: err => {
				console.log('error', err);
				this.alertMessage(err);
			}
		})
	}


	async alertMessage(err) {
		const alert = await this.alertController.create({
		  header: 'Error!',
		  message: `${err.error.errorMessage}`,
		  buttons:[
			{
			  text: 'Ok',
			  role: 'cancel',
			}
		  ]
		})
	
	   await alert.present();
	  }

}
