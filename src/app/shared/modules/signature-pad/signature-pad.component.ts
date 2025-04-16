import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import SignaturePad from 'signature_pad';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActionSheetController, IonicModule, ModalController, NavParams } from '@ionic/angular';
import { StartOrEndJob } from 'src/app/models/todays-job.model';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { CommonService } from 'src/app/core/services/common/common.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@awesome-cordova-plugins/file-transfer/ngx';
import { MediaItems } from 'src/app/post-auth/dashboard/order-details/order-media/order-media.component';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { UNDEFINED_GEO_LAT, UNDEFINED_GEO_LONG } from 'src/app/utils/constants';
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';


@Component({
	standalone: true,
	selector: 'app-signature-pad',
	templateUrl: './signature-pad.component.html',
	styleUrls: ['./signature-pad.component.css'],
	imports: [CommonModule, IonicModule, FormsModule,HeaderComponent],

})
export class SignaturePadComponent implements OnInit {
	@ViewChild('signaturePad') signaturePadEle: ElementRef;

	headerInfo: GlobalHeaderObject = {
		isBackBtnVisible: false,
		isnotificationIconVisible: false,
		isUserProfileVisible: false,
		headerText: `Start job`,
	  };

	getAuthState: Observable<AuthState>;
	authData: AuthState;
	authMeta: AuthMeta;

	baId: string = '';
	accountId;
	jobCardId;
	mode;

	private signaturePadData: SignaturePad;

	canvas: any;
	lastX: any;
	lastY: any;
	currentColour: any;
	brushSize: any;


	capturedSignature: any;
	capturedLat: any;
	capturedLong: any;
	capturedRemarks: string

	jobMedia = [];


	uploadedMedia = []
	result: string;

	constructor(
		private leadHelperService: LeadHelperService,
		private store: Store<AppState>,
		private modalController: ModalController,
		private navParams: NavParams,
		public mediaService: MediaUploadService,
		private fileTransfer: FileTransfer,
		private commonService: CommonService,
		private loaderService: IonLoaderService,
		private cd: ChangeDetectorRef,
		private actionSheetCtrl: ActionSheetController,
		private mediaStreaming: MediaStreamingService,
		private router: Router
		
	) {
		this.getAuthState = this.store.select(selectAuthData);
	}

	ngOnInit() {

		this.baId = this.navParams.get('baId');
		this.accountId = this.navParams.get('accountId');
		this.jobCardId = this.navParams.get('jobCardId');
		this.mode = this.navParams.get('mode');
		
		this.getAuthState.subscribe((authState) => {
			this.authData = authState;
			this.authMeta = authState.authMeta;
			this.baId = this.authMeta.employee.businessAccountId;
			this.accountId = this.authMeta.employee.accountId;
			console.log('this.authData ', this.baId, this.accountId);
		})
 
		this.mediaService.triggerUploadObs$.subscribe((data) => {
			console.log('TRIGGER UPLOAD', data);
			if(this.mediaService.isMediaUploadInProgress) return;
			if (data.upload && data.componentName === this.constructor.name && this.mediaService.mediaList.length > 0) {
				if (this.mediaService.mediaList[0].type.includes('image')) {
					this.uploadImageToS3(this.mediaService.mediaList[0]);
				} else {
					this.uploadVideoToS3(this.mediaService.mediaList[0]);
				}
			}
		});
	}

	ngAfterViewInit() {

		this.inItCanvas();

	}

	inItCanvas() {
		this.canvas = this.signaturePadEle?.nativeElement;
		this.signaturePadData = new SignaturePad(this.canvas, {
			penColor: "rgb(0, 0, 0)",
			dotSize: 1,
			throttle: 0.4,
			velocityFilterWeight: 0.7,
		});

		console.log('this.canvas', this.signaturePadData);

		// Set the canvas dimensions
		this.canvas.width = window.innerWidth - 30; // to take inner width of the available screen set this to 'window.innerWidth'
		this.canvas.height = 400;

	}

	async saveSignature() {

		const signature = this.signaturePadData.toDataURL();
		this.capturedSignature = this.signaturePadData.toDataURL();
		console.log('signature', signature);
		// get current geo lat long 
		// await this.geolocation.
		// let isLocationPermissionAvailable = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
		// console.log('isLocationPermissionAvailable',isLocationPermissionAvailable);
		
		// if (isLocationPermissionAvailable.hasPermission) {
		//   // Location permission granted, do something here
		//   const latLongRespose = await this.geolocation.getCurrentPosition();
		//   if(latLongRespose.coords) {
		// 	let { coords, ...rest } = latLongRespose;
		// 	console.log('REST PROPERTIES', rest);
			
		// 	this.capturedLat =  coords.latitude,
		// 	this.capturedLong =  coords.longitude

		// 	console.log('this.capturedLat', this.capturedLat);
		// 	this.startJob();
		//   }
		 
		// } else {
		//   // Location permission not granted, show a prompt to the user
		//   console.log('PERMISSION NOT EXIST');
		// }
		this.capturedLat = UNDEFINED_GEO_LAT;
		this.capturedLong = UNDEFINED_GEO_LONG;
		this.startJob();
	}
	
	startJob() {
		
		let payload: StartOrEndJob = {
			customerSIgnature: this.capturedSignature,
			geoLat: this.capturedLat,
			geoLng: this.capturedLong,
			remarks: this.capturedRemarks,
			media: [],
			time: new Date().toISOString()
		}
		
		console.log('payload',payload);

		this.cancelCanvas({...payload, isJobStarted: true, media: this.jobMedia});
		// this.commonService.refreshJobDetails.next(true);
	}
	  
	clearCanvas() {
		this.signaturePadData.clear();
	}

	cancelCanvas(data?: any) {
		if(!data) {
			this.modalController.dismiss()
		} else {
			this.modalController.dismiss(data);

			if(this.router.url.includes('lead/employee-jobs/job-details')) {
				this.commonService.refreshJobDetail(true)
			}

		}
	}

	ngOnDestroy() {
		this.signaturePadData.clear();
	}

	remarksChanged(e) {
		this.capturedRemarks = e.detail.value;
	}

	async uploadMedia() {
		// await this.loaderService.createLoading('loading media..')
		await this.mediaService.selectAndUploadMediaFromGallery(this.constructor.name ,true, null);
		// console.log('mediaK', mediaK);
	}
	
	/**
   * Using cordova file transfer plugin
   *
   * @param image
   */
	async uploadImageToS3(image) {
		await this.loaderService.dismissLoading();
		this.mediaService.isMediaUploadInProgress = true;
		this.loaderService.createLoading('Uploading image..');
		console.log('uploading image file:', image);
		const payload = {
			fileTitle: image.name,
		};
		console.log(
			'uploading image file:',
			image.fullPath,
			this.jobCardId,
			image
		);
		this.leadHelperService
			.uploadStartOrEndJobMedia(
			this.baId,
			'job-card',
			this.jobCardId,
			payload
			)
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
							console.log(
								`media file upload success: ${uploadLocationData[0].type}`,
								image.fullPath
							); 

							let newMedia: MediaItems = {
								accessLink: fileUrl,
								fileType: 'image',
								thumbnail: fileUrl,
								serviceRequestId: this.jobCardId,
								referenceId: uploadLocationData[0].referenceId,
								uploadedByAcc:this.accountId
							};

							this.jobMedia.push(newMedia);
							// this.uploadedMedia = [...this.jobMedia];
							this.mediaService.isMediaUploadInProgress = false;
							this.jobMedia = [...this.jobMedia];
							this.cd.detectChanges(); 
				 
						 
							console.log('this.medias',this.jobMedia);
							this.mediaService.mediaList = [];
							await this.loaderService.dismissLoading();
							this.commonService.showToast(
								'Media is uploaded successfully.'
							);
								
						},
						async (err) => {
						console.log(
							`media file upload failed: ${uploadLocationData[0].type}`,
							image.fullPath,
							JSON.stringify(err)
						);
						this.commonService.showToast(
							'Error while uploaing media, Please try again.'
						);
						await this.loaderService.dismissLoading();
						}
					);
				},
				error:async (err) => {
					console.log('err', err);
					this.commonService.showToast(
					'Error while generating upload location, Please try again.'
					);
					await this.loaderService.dismissLoading();
				},
				complete: () => {
					console.log('Upload is done ');
				},
			});
	}

	async uploadVideoToS3(video) {
		await this.loaderService.dismissLoading();
		this.mediaService.isMediaUploadInProgress = true;
		await this.loaderService.createLoading('Uploading video...');
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
								this.commonService.showToast(
									'Media is uploaded successfully.'
								);
								// this.cd.detectChanges()
								console.log(JSON.stringify(result));
								// this.commonService.refreshJobDetails.next(true);
								let fileUrl = null;


								let thumbnailUrl = null;

								if (location.type == 'image/video') {
									fileUrl = location.accessLink;
								} else if (location.type == 'thumbnail') {
									thumbnailUrl = location.accessLink;
								}

								if (location.type !== 'thumbnail') {
							

									let newMedia = {
										accessLink: location.accessLink,
										fileType: 'video',
										thumbnail: thumbnailLocation,
										serviceRequestId: this.jobCardId,
										referenceId: location.referenceId,
										uploadedByAcc:this.accountId
									};

									this.jobMedia.push(newMedia);
								}
								// this.cd.detectChanges()
								this.mediaService.mediaList = [];
								this.mediaService.isMediaUploadInProgress = false;
								await this.loaderService.dismissLoading();
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

	async mediaUploadActionSheet() {
		const actionSheet = await this.actionSheetCtrl.create({
		  header: 'Choose how to upload media',
		  subHeader: `${this.mode} job`,
		  buttons: [
			
			{
			 	text: 'Upload',
				handler: () => {
					this.uploadMedia();
				}
				
			},
			{
			  	text: 'Capture image',
				handler: () => {
					console.log('trigger capture image');
					this.mediaService.captureImage(this.constructor.name).then(() => {
						console.log('Sent to upload');
						
					});
				}
		
			},
			{
				text: 'Capture video',
				handler: () => {
					console.log('trigger capture video');
					this.mediaService.captureVideo(this.constructor.name).then(() => {
						console.log('Sent to upload');
						
					});
				}
			},
			{
			  text: 'Cancel',
			  role: 'cancel',
			  data: {
				action: 'cancel',
			  },
			},
		  ],
		});
	
		await actionSheet.present();
	
		const result = await actionSheet.onDidDismiss(); 
		
	}

	trackItems(index: number, itemObject: any) {
		console.log('itemObject', itemObject);
		
		return itemObject.referenceId;
	  }

	doRefresh(event) {
		this.jobMedia = [...this.jobMedia];
		this.cd.detectChanges();
		event.target.complete();

	}

	playMedia(mediaIndex) {
		this.mediaStreaming.playMedia(this.jobMedia, mediaIndex)
	}
}
