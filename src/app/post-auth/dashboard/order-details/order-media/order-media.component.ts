import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
} from '@angular/core';
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject,
} from '@awesome-cordova-plugins/file-transfer/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import {
  StreamingMedia,
  StreamingVideoOptions,
} from '@awesome-cordova-plugins/streaming-media/ngx';
import {
  ActionSheetController,
  AlertController,
  ModalController,
} from '@ionic/angular';
import { Store } from '@ngrx/store';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { CustomerServiceItem } from 'src/app/models/customer-service-item.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';

export interface MediaItems {
  serviceRequestId?: any;
  accessLink: string;
  fileType: string;
  id?: number;
  thumbnail: string;
  referenceId: string;
  uploadedByAcc?: number;
}

@Component({
  selector: 'app-order-media',
  templateUrl: './order-media.component.html',
  styleUrls: ['./order-media.component.css'],
})
export class OrderMediaComponent implements OnInit {
  @Input() orderMedie: MediaItems[];
  @Input() authMeta: AuthMeta;
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
    private mediaStreaming: MediaStreamingService,
    private mediauploadService: MediaUploadService,
    private fileTransfer: FileTransfer,
    private cd: ChangeDetectorRef,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.commonService.refreshMediaObs$.subscribe(async (data:boolean) => {
      if (data) {
        this.orderMedie = this.orderMedie;
        this.cd.detectChanges();
      }
    });


    this.mediauploadService.triggerUploadObs$.subscribe(async (data) => {
      console.log('TRIGGER UPLOAD', data);
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
          text: `${this.orderMedie[i].fileType.includes('image') ? 'View' : 'Play'
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


  playMedia(mediaIndex: number) {

    this.mediaStreaming.playMedia(this.orderMedie, mediaIndex)
  }


  async addMedia() {
    await this.mediauploadService.selectAndUploadMediaFromGallery(this.constructor.name, true, null);
  }

  /**
   * Using cordova file transfer plugin
   *
   * @param image
   */
  async uploadImageToS3(image) {
    await this.loaderService.createLoading('Uploading image...')
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
        this.authMeta.customer.id,
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
                    this.authMeta?.customer?.id,
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
                          uploadedByAcc: this.authMeta?.customer?.accountId
                        };
                        this.orderMedie.push(newMedia);

                        this.emitRefresh.emit(true);
                        this.mediauploadService.mediaList = [];
                        this.cd.detectChanges();
                        await this.loaderService.dismissLoading();
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
        error: async (err) => {
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
    await this.loaderService.createLoading('Uploading video...')
    console.log('uploading video and thumbnail files:', video.fullPath);
    const payload = {
      fileTitle: video.name,
      thumbnailTitle: video.thumbnailName,
    };
    let thumbnailLocation;
    this.orderService
      .generateUploadLocation(
        this.authMeta?.customer?.id,
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

                    console.log(JSON.stringify(result));
                  },
                  async (err) => {
                    console.log(
                      `media file upload failed: ${location.type}`,
                      uploadFile,
                      JSON.stringify(err)
                    );
                  }
                );

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
                    this.authMeta?.customer?.id,
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
                          uploadedByAcc: this.authMeta?.customer?.accountId
                        };
                        this.orderMedie.push(newMedia);
                        this.cd.detectChanges();
                      }
                      this.emitRefresh.emit(true);
                      console.log('ackUploadLocation', data);
                      this.mediauploadService.mediaList = [];

                      await this.loaderService.dismissLoading();
                    },
                    async (err) => {
                      console.log('err', err);
                      await this.loaderService.dismissLoading();
                    }
                  );
              }
            });
          }
        },
        error: async (err) => {
          console.log('err', err);
          await this.loaderService.dismissLoading();
        },
        complete: () => {
          console.log('Upload is done ');
        },
      });
  }

  async deleteMedia(i) {
    let selectedMedia = this.orderMedie[i];
    let msg = `Are you sure you want to delete this ${selectedMedia.fileType.includes('image') ? 'Image' : 'Video'
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
            this.delete(i);
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log(`Dismissed with role: ${role}`);
  }


  delete(i) {
    this.orderService
      .deleteMedia(
        this.authMeta.customer.id,
        this.srOrderData.serviceRequestId,
        this.orderMedie[i]?.id
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.orderMedie = this.orderMedie.filter(
              (x) => x.id !== this.orderMedie[i]?.id
            );
            this.orderMedie = [...this.orderMedie];
            this.commonService.showToast(
              'Media is deleted successfully.'
            );
          }
        },
        error: (err) => {
          console.log(err);
          this.alertMessage(err);
        },
      });
  }


  async alertMessage(err) {
    const alert = await this.alertController.create({
      header: 'Error!',
      message: `${err.error.errorMessage}`,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        }
      ]
    })

    await alert.present();
  }

}
