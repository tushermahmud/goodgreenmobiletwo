import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@awesome-cordova-plugins/file-transfer/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@awesome-cordova-plugins/streaming-media/ngx';
import { ActionSheetController, AlertController, IonicModule, ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { CustomerServiceItem } from 'src/app/models/customer-service-item.model';
import { MediaItems } from 'src/app/post-auth/dashboard/order-details/order-media/order-media.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';

@Component({
  standalone: true,
  selector: 'app-agent-service-media',
  templateUrl: './agent-service-media.component.html',
  styleUrls: ['./agent-service-media.component.css'],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AgentServiceMediaComponent implements OnInit {

  @Input() orderMedie: any[];
  @Input() authMeta: AuthMeta;
  @Input() customerId: any;
  @Input() srOrderData: CustomerServiceItem;

  @Output() emitRefresh: EventEmitter<boolean> = new EventEmitter(false);

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

  constructor(
    public modalController: ModalController,
    private orderService: OrderService,
    private commonService: CommonService,
    private loaderService: IonLoaderService,
    private streamingMedia: StreamingMedia,
    private mediaStreaming: MediaStreamingService,
    private mediauploadService: MediaUploadService,
    private fileTransfer: FileTransfer,
    private cd: ChangeDetectorRef,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.commonService.refreshMediaObs$.subscribe(async (data) => {
      if (data) {
        this.orderMedie = this.orderMedie;
        this.cd.detectChanges();
      }
    });


    this.mediauploadService.triggerUploadObs$.subscribe(async (data) => {
      console.log('TRIGGER UPLOAD', data);
      if(this.mediauploadService.isMediaUploadInProgress) return;
      if (data.upload && data.componentName === this.constructor.name && this.mediauploadService.mediaList.length > 0) {
        if (this.mediauploadService.mediaList[0].type.includes('image')) {
          this.uploadImageToS3(this.mediauploadService.mediaList[0]);
        } else {
          this.uploadVideoToS3(this.mediauploadService.mediaList[0]);
        }
      }
    });

    
  }

  async presentActionSheet(i) {
    const actionSheet = await this.actionSheetCtrl.create({
      // header: 'Example header',
      // subHeader: 'Example subheader',
      cssClass: 'c-action-sheet',
      buttons: [
        {
          text: `${
            this.orderMedie[i].fileType.includes('image') ? 'View' : 'Play'
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

  async presentAlert(i) {
    let selectedMedia = this.orderMedie[i];
    let msg = `Are you sure you want to delete this ${
      selectedMedia.fileType.includes('image') ? 'Image' : 'Video'
    }?`;
    const alert = await this.alertController.create({
      header: msg,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Alert canceled');
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            console.log('Alert confirmed');
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log(`Dismissed with role: ${role}`);
  }

  playMedia(mediaIndex: number) {

		this.mediaStreaming.playMedia(this.orderMedie, mediaIndex)
	}



  async addMedia() {
    await this.mediauploadService.selectAndUploadMediaFromGallery( this.constructor.name ,true, null);
  }

  /**
   * Using cordova file transfer plugin
   *
   * @param image
   */
  async uploadImageToS3(image) {
    await this.loaderService.dismissLoading();
    this.mediauploadService.isMediaUploadInProgress = true;
    await this.loaderService.createLoading('Uploading media...');
    console.log('uploading image file:', image);
    const payload = {
      fileTitle: image.name,
    };
    console.log(
      'uploading image file:',
      image.fullPath,
      this.srOrderData.serviceRequestId,
      image
    );
    this.orderService
      .generateUploadLocation(
        this.authMeta.agent.id,
        'service-request',
        this.srOrderData.serviceRequestId,
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

          await fileTransfer
            .upload(image.fullPath, uploadLocationData[0].uploadUrl, options)
            .then(
              async (result) => {
                console.log(
                  `media file upload success: ${uploadLocationData[0].type}`,
                  image.fullPath
                );

                // inform backend that upload is success and pass the uploaded s3 location
                const payload = {
                  fileUrl: uploadLocationData[0].accessLink,
                  mediaType: 'image',
                  thumbnailUrl: uploadLocationData[0].accessLink,
                  referenceId: uploadLocationData[0].referenceId,
                };
                this.orderService
                  .ackUploadLocation(
                    this.customerId,
                    'service-requests',
                    this.srOrderData.serviceRequestId,
                    payload
                  )
                  .subscribe(
                    async (data) => {
                      console.log('ackUploadLocation', data);
                      // pushNew Media
                      if (data) {
                        let newMedia: MediaItems = {
                          accessLink: fileUrl,
                          fileType: 'image',
                          thumbnail: fileUrl,
                          serviceRequestId: this.srOrderData.serviceRequestId,
                          referenceId: uploadLocationData[0].referenceId,
                          
                        };
                        this.orderMedie.push(newMedia);
                        this.mediauploadService.mediaList = [];

                        await this.loaderService.dismissLoading();
                        this.emitRefresh.emit(true);
                        this.mediauploadService.isMediaUploadInProgress = false;
                        this.cd.detectChanges();
                        this.commonService.showToast(
                          'Media is uploaded successfully.'
                        );
                      }
                    },
                   async (error) => {
                      console.log(error);

                      this.commonService.showToast(
                        'Error while saving media, Please try again.'
                      );
                      await this.loaderService.dismissLoading();
                    }
                  );
                console.log(JSON.stringify(result));
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
        error:async  (err) => {
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
    this.mediauploadService.isMediaUploadInProgress = true;
   await this.loaderService.createLoading('Uploading media...');
    console.log('uploading video and thumbnail files:', video.fullPath);
    const payload = {
      fileTitle: video.name,
      thumbnailTitle: video.thumbnailName,
    };
    let thumbnailLocation;
    this.orderService
      .generateUploadLocation(
        this.customerId,
        'service-request',
        this.srOrderData.serviceRequestId,
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
              thumbnailLocation =
                location.type === 'thumbnail' ? location.accessLink : null;
              uploadFile =
                location.type === 'thumbnail'
                  ? video.thumbnailFile
                  : video.fullPath;
              contentType =
                location.type === 'thumbnail'
                  ? { 'Content-Type': 'image/jpeg' }
                  : { 'Content-Type': video.type };
              mimeType =
                location.type === 'thumbnail' ? 'image/jpeg' : video.type; // thumbnail file

              const fileTransfer: FileTransferObject =
                this.fileTransfer.create();
              const options: FileUploadOptions = {
                httpMethod: location.httpMethod,
                headers: contentType,
                mimeType,
                chunkedMode: false,
              };
              await fileTransfer
                .upload(uploadFile, location.uploadUrl, options)
                .then(
                  (result) => {
                    console.log(
                      `media file upload success: ${location.type}`,
                      uploadFile
                    );
                    this.mediauploadService.mediaList = [];
                    console.log(JSON.stringify(result));
                    
                    let fileUrl = null;
                    let thumbnailUrl = null;
                    if (location.type == 'image/video') {
                      fileUrl = location.accessLink;
                    } else if (location.type == 'thumbnail') {
                      thumbnailUrl = location.accessLink;
                    }
                    if (location.type !== 'thumbnail') {
                      const payload = {
                        fileUrl: fileUrl,
                        mediaType: 'video',
                        thumbnailUrl: thumbnailLocation,
                        referenceId: location.referenceId,
                      };

                      this.orderService
                        .ackUploadLocation(
                          this.customerId,
                          'service-requests',
                          this.srOrderData.serviceRequestId,
                          payload
                        )
                        .subscribe(
                          async (data) => {
                            if (data) {
                              let newMedia: MediaItems = {
                                accessLink: fileUrl,
                                fileType: 'video',
                                thumbnail: thumbnailLocation,
                                serviceRequestId: this.srOrderData.serviceRequestId,
                                referenceId: location.referenceId,
                              };
                              this.orderMedie.push(newMedia);
                              this.cd.detectChanges();
                            }
                            this.emitRefresh.emit(true);
                            console.log('ackUploadLocation', data);
                            
                            this.mediauploadService.isMediaUploadInProgress = false;
                            await this.loaderService.dismissLoading();
                          },
                          async (err) => {
                            console.log('err', err);
                            await this.loaderService.dismissLoading();
                          }
                        );
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

  deleteMedia(i) {
    console.log('DElete MEdia', this.orderMedie[i]);
    this.presentAlert(i).then((res) => {
      console.log('DElete MEdia res', res);

      this.orderService
        .deleteMedia(
          this.authMeta.agent.id,
          this.srOrderData.serviceRequestId,
          this.orderMedie[i].id
        )
        .subscribe({
          next: (data) => {
            if (data) {
              this.orderMedie = this.orderMedie.filter(
                (x) => x.id !== this.orderMedie[i].id
              );
              this.orderMedie = [...this.orderMedie];
            }
          },
          error: (err) => {
            console.log(err);
          },
        });
    });
  }

}
