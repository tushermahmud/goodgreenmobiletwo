/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable curly */
/* eslint-disable no-var */
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import {
    MediaCapture,
    MediaFile,
    CaptureError,
    CaptureVideoOptions,
} from '@awesome-cordova-plugins/media-capture/ngx';
import {
    StreamingMedia,
    StreamingVideoOptions,
} from '@awesome-cordova-plugins/streaming-media/ngx';
import { VideoEditor } from '@awesome-cordova-plugins/video-editor/ngx';
import { Router } from '@angular/router';
import {
    ActionSheetController,
    AlertController,
    AnimationController,
    IonicModule,
    IonModal,
    LoadingController,
    NavController,
} from '@ionic/angular';
import { File } from '@awesome-cordova-plugins/file/ngx';
import {
    PhotoViewer,
} from '@awesome-cordova-plugins/photo-viewer/ngx';
import { OrderService } from 'src/app/core/services/order/order.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { uploadImages, uploadVideos } from 'src/app/state/order/order.actions';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { OverlayEventDetail } from '@ionic/core/components';
import SwiperCore, { Pagination } from 'swiper';
import { DevicePlatform } from 'src/app/definitions/device-platform.enum';
import { AuthState } from 'src/app/state/auth/auth.state';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { CommonModule } from '@angular/common';


SwiperCore.use([Pagination]);

// as per documentaion https://github.com/apache/cordova-plugin-media-capture
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
const ALLOWED_VIDEO_MIME_TYPE_3GPP = 'video/3gpp';
const ALLOWED_VIDEO_MIME_TYPE_MP4 = 'video/mp4';
const ALLOWED_VIDEO_MIME_TYPE_MOV = 'video/quicktime';
const ALLOWED_IMAGE_MIME_TYPE_JPEG = 'image/jpeg';
const ALLOWED_IMAGE_MIME_TYPE_JPG = 'image/jpg';
const ALLOWED_IMAGE_MIME_TYPE_PNG = 'image/png';

// upload reference article: https://medium.com/@cezennia/ionic-video-upload-39f6a2406d89
// image compression article: https://ionicacademy.com/create-thumbnail-image-ionic/
// CAMERA customization tips https://www.joshmorony.com/ionic-go-create-a-pokemon-go-style-interface-in-ionic-2/

@Component({
    selector: 'app-video-capture',
    templateUrl: './video-capture.component.html',
    styleUrls: ['./video-capture.component.css'],
    standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideoCaptureComponent implements OnInit {
    @ViewChild(IonModal) modal: IonModal;

    private currentCapturedImage: any = null;
    private currentRecordedVideo: any = null;

    // videoOptions: CaptureImageOptions = { limit: 1 };
    private videoOptions: CaptureVideoOptions = { limit: 1, duration: FIFTEEN_MINUTES_IN_SECONDS, quality: 480 };

    private streamingMediaOptions: StreamingVideoOptions = {
        successCallback: () => {
            console.log('Video played');
        },
        errorCallback: (e) => {
            console.log(e);
        },
        // orientation: 'landscape',
        shouldAutoClose: true,
        controls: true,
    };

    videoList: any[] = [
        // {
        //   end: '127082',
        //   fullPath: 'file:///storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp%20Images/IMG-20220623-WA0000.jpg',
        //   lastModified: 1655960032000,
        //   lastModifiedDate: 1655960032000,
        //   localURL: 'cdvfile://localhost/sdcard/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp%20Images/IMG-20220623-WA0000.jpg',
        //   name: 'IMG-20220623-WA0000.jpg',
        //   size: 127082,
        //   start: 0,
        //   type: 'image/jpeg'
        // },
    ];
    imageList: any[] = [
        // {
        //   end: '127082',
        //   fullPath: 'file:///storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp%20Images/IMG-20220623-WA0000.jpg',
        //   lastModified: 1655960032000,
        //   lastModifiedDate: 1655960032000,
        //   localURL: 'cdvfile://localhost/sdcard/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp%20Images/IMG-20220623-WA0000.jpg',
        //   name: 'IMG-20220623-WA0000.jpg',
        //   size: 127082,
        //   start: 0,
        //   type: 'image/jpeg'
        // },
    ];



    permissionPopupData = [{
        permissionIcon: '../../../../assets/images/media/fill-enable-notification--color-brand.svg',
        permissionName: 'ENABLE NOTIFICATION',
        permissionDescription: 'Enable notifications from Good Green to receive timely updates on your upcoming service reminders & updates in real time.'
    },
    {
        permissionIcon: '../../../../assets/images/media/fill-enable-camera--color-brand.svg',
        permissionName: 'ENABLE CAMERA',
        permissionDescription: 'Camera permission is required so that you can record the items to be moved, packed, organized etc. '
    },
    {
        permissionIcon: '../../../../assets/images/media/fill-enable-microphone--color-brand.svg',
        permissionName: 'ENABLE MICROPHONE',
        permissionDescription: 'Microphone permission is required for the app the record your voice while recording your items to be moved, packed, organized etc. '
    }, {
        permissionIcon: '../../../../assets/images/media/fill-enable-device-storage--color-brand.svg',
        permissionName: 'ENABLE DEVICE STORAGE',
        permissionDescription: 'Permission to attach your existing images or videos from your gallery while creating a new service request with Good Green.'
    }];

    selectedVideo: string; //= "https://res.cloudinary.com/demo/video/upload/w_640,h_640,c_pad/dog.mp4";
    uploadedVideo: string;
    isUploading = false;
    uploadPercent = 0;
    loader;
    //loading: HTMLIonLoadingElement = null;

    uploader;

    getAuthState: Observable<AuthState>;
    authData: AuthState;

    videoEditorOptions = {
        OptimizeForNetworkUse: {
            NO: 0,
            YES: 1,
        },
        OutputFileType: {
            M4V: 0,
            MPEG4: 1,
            M4A: 2,
            QUICK_TIME: 3,
        },
    };

    message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
    name: string;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: false,
        isUserProfileVisible: false,
        headerText: `Media`
    };

    isPermissionGranted;

    constructor(private camera: Camera,
        private mediaCapture: MediaCapture,
        private streamingMedia: StreamingMedia,
        private videoEditor: VideoEditor,
        private router: Router,
        public navCtrl: NavController,
        private file: File,
        private photoViewer: PhotoViewer,
        private orderService: OrderService,
        private store: Store<AppState>,
        private cd: ChangeDetectorRef,
        public loadingController: LoadingController,
        private permissionService: PermissionManagerService,
        private animationCtrl: AnimationController,
        private alertController: AlertController,
        private webview: WebView,
        public actionSheetController: ActionSheetController) {
        this.getAuthState = this.store.select(selectAuthData);
        
    }

    async presentLoader(message: string) {

        const loading = await this.loadingController.create({
            cssClass: 'my-custom-class',
            message,
        });
        loading.present();
        console.log('Loading displayed!');
        return loading;
    }

    async ngOnInit(): Promise<void> {
        this.getAuthState.subscribe((user) => {
            this.authData = user;
            if (this.authData.isAuthenticated) {
                this.heraderInfo.isUserProfileVisible = true;
            }
        });

        await this.permissionService.waitTillReady();
        await this.permissionService.arePermissionsGranted()
        this.isPermissionGranted = this.permissionService.permissionStatus;
        console.log('PERMISSION STATUS isPermissionGranted', this.isPermissionGranted);
    }

    /**
     * Captures image from the device's camera
     */
    async captureImage() {

        console.log('captureImage =====>');
        await this.mediaCapture.captureImage(/** { limit: 1} default 1 image */).then(

            (data: any[]) => {

                console.log(`current-platform: ${this.permissionService.CurrentPlatform} captured image:`, JSON.stringify(data[0]));
                this.currentCapturedImage = data[0];
                this.currentCapturedImage['thumbnail'] = this.sanitizedPathForImage(data[0].fullPath);
                if (this.permissionService.CurrentPlatform === DevicePlatform.IOS) {
                    this.currentCapturedImage['fullPath'] = 'file://' + data[0].fullPath;
                }
                else { // for android and maybe unknown platforms
                    this.currentCapturedImage['fullPath'] = data[0].fullPath;
                }
                
                // console.log('current captured image:', JSON.stringify(this.currentCapturedImage));
                this.imageList.push(this.currentCapturedImage);
                this.cd.detectChanges();
            },
            (err: CaptureError) => {

                //  If the user terminates the operation before capturing an image,
                // this error CaptureError object is returned with CaptureError.CAPTURE_NO_MEDIA_FILES
                console.error('image capture error:', JSON.stringify(err));
                // if (+err.code != CaptureError.CAPTURE_NO_MEDIA_FILES) {
                //     throw err;
                // }
            }
        ).catch(async err => {

            console.error('image capture error:', err, JSON.stringify(err));
            await this.throwAlert(this.alertController, 'Picture Error', err);
        });
    }

    /**
     * Capture video from device's camera
     */
    async captureVideo() {

        console.log('captureVideo =====>');

        let loader: HTMLIonLoadingElement = null;
        await this.mediaCapture.captureVideo(this.videoOptions).then(async (data: any[]) => {

            console.log('captured video clips:', JSON.stringify(data));

            loader = await this.presentLoader('Optimizing video file');
            /** Creating a video thumbnail image */
            const tb = await this.createThumbnail(data[0].fullPath, data[0].name);
            console.log(`created thumbnail of video captured:`, tb.thumbnail);
            this.currentRecordedVideo = data[0];
            this.currentRecordedVideo['thumbnailFile'] = 'file://' + tb.thumbnail;
            this.currentRecordedVideo['thumbnail'] = this.sanitizedPathForImage('file://' + tb.thumbnail); //this.win.Ionic.WebView.convertFileSrc(thumbnail);//'file://' + thumbnail;
            this.currentRecordedVideo['thumbnailName'] = tb.thumbnailName;
            /** transcode the recorded video */
            const transcodedVideoPath = await this.transcodeVideo(data[0].fullPath, data[0].name);
            this.currentRecordedVideo['fullPath'] = 'file://' + transcodedVideoPath;
            console.log('recorded video path:', JSON.stringify(this.currentRecordedVideo));
            this.videoList.push(this.currentRecordedVideo);
            this.cd.detectChanges();
            await loader.dismiss();


        }, (err: CaptureError) => {

            console.error('video capture error:', JSON.stringify(err));
            // if (+err.code != CaptureError.CAPTURE_NO_MEDIA_FILES) {
            //     throw err;
            // }

        }).catch(async err => {
            await loader.dismiss();
            console.error('video capture error:', JSON.stringify(err));
            await this.throwAlert(this.alertController, 'Video Capture Error', err);
        });
    }

    checkStorage() {
        console.log(this.videoList, this.imageList);
    }

    /**
     * Plays the video that the user has selected to upload
     *
     * @param index
     */
    async playVideo(index: number) {

        try {
            console.log('playing video:', this.videoList[index]);
            this.streamingMedia.playVideo(
                this.videoList[index].fullPath,
                this.streamingMediaOptions
            );
        }
        catch (err) {
            await this.throwAlert(this.alertController, 'Video Playback Error', err);
        }
    }

    /**
     * Opens an image that the user has selected
     *
     * @param index
     */
    async openImage(index: number) {

        try {
            console.log('opening image:', JSON.stringify(this.imageList[index]));
            this.photoViewer.show(
                this.imageList[index].fullPath,
                this.imageList[index].name,
                {
                    share: false,
                    closeButton: true,
                    copyToReference: true,
                    headers: this.imageList[index].type
                }
            );
        }
        catch (err) {
            await this.throwAlert(this.alertController, 'Image View Error', err);
        }
    }

    /**
     * Removes a media file from the selection
     *
     * @param index
     * @param type
     */
    remove(index: number, type: 'image' | 'video') {
        if (type === 'image') {
            this.imageList.splice(index, 1);
        } else if (type === 'video') {
            this.videoList.splice(index, 1);
        }
        this.cd.detectChanges();
    }

    submitVideo() {
        this.store.dispatch(
            uploadVideos({
                videoList: this.videoList,
            })
        );
        this.store.dispatch(
            uploadImages({
                imageList: this.imageList,
            })
        );


        this.router.navigate(['iauth', 'video-upload', 'pickup-location']);
    }

    cancelSelection() {
        this.selectedVideo = null;
        this.uploadedVideo = null;
    }

    private async checkPermissions() {

        const permissionStatus = await this.permissionService.checkDevicePermission();
        console.log('permissionStatus', permissionStatus);
        return permissionStatus;
    }

    /**
     * Selects an image or video existing from the device's gallery
     */
    async selectMediaFromGallery() {

        await this.checkPermissions();

        let destinationType = this.camera.DestinationType.FILE_URI; // default to android
        if (this.permissionService.CurrentPlatform === DevicePlatform.IOS) {
            destinationType = this.camera.DestinationType.NATIVE_URI; // for iOS
        }
        const options: CameraOptions = {
            quality: 50,
            destinationType,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.ALLMEDIA,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        };
        await this.camera.getPicture(options).then(
            async (mediaUrl) => {
                if (mediaUrl) {


                    const filename = mediaUrl.substr(mediaUrl.lastIndexOf('/') + 1);
                    let dirpath = mediaUrl.substr(0, mediaUrl.lastIndexOf('/') + 1);

                    dirpath = dirpath.includes('file://') ? dirpath : 'file://' + dirpath;

                    try {
                        const dirUrl = await this.file.resolveDirectoryUrl(dirpath);
                        var retrievedFile = await this.file.getFile(dirUrl, filename, {});
                    } catch (err) {
                        console.log('error resolving selected media path from gallery', err);
                        throw err;
                    }

                    retrievedFile.file(async (data: any) => {

                        console.log('selected media file info:', JSON.stringify(data));

                        // this.selectedVideo = retrievedFile.nativeURL;
                        data.fullPath = retrievedFile.nativeURL;
                        let loader: HTMLIonLoadingElement = null;

                        if (this.allowedVideoFormats(data.type)) {

                            loader = await this.presentLoader('Optimizing video file');

                            /** Creating a video thumbnail image */
                            const tb = await this.createThumbnail(data.fullPath, data.name);
                            console.log(`created thumbnail of video captured:`, tb.thumbnail);
                            const selectedVideo = data;
                            selectedVideo['thumbnailFile'] = 'file://' + tb.thumbnail;
                            selectedVideo['thumbnail'] = this.sanitizedPathForImage('file://' + tb.thumbnail);
                            selectedVideo['thumbnailName'] = tb.thumbnailName;
                            /** transcode the recorded video */
                            const transcodedVideoPath = await this.transcodeVideo(data.fullPath, data.name);
                            selectedVideo['fullPath'] = 'file://' + transcodedVideoPath;
                            console.log('selected Video path:', JSON.stringify(selectedVideo));
                            this.videoList.push(selectedVideo);

                        } else if (this.allowedImageFormats(data.type)) {

                            loader = await this.presentLoader('Optimizing image file');
                            const selectedImage = data;
                            selectedImage['thumbnail'] = this.sanitizedPathForImage(data.fullPath);
                            console.log('selectedImage info:', JSON.stringify(selectedImage));
                            this.imageList.push(selectedImage);

                        } else {

                            const subheader = `Unsupported format - ${data.type}`;
                            await this.throwAlert(this.alertController, subheader, new Error('This file is not supported, please choose another one.'));
                        }

                        this.cd.detectChanges();
                        await loader?.dismiss();
                    });
                }
            },
            async (err) => {
                console.log(`error picking media file from gallery:`, JSON.stringify(err));
                throw err;
            }
        ).catch(async err => {
            console.log(`error picking media file from gallery:`, JSON.stringify(err));
            //await this.throwAlert(this.alertController, 'Select Media Failed', err);
        });
    }

    goBack() {
        this.navCtrl.back();
    }

    cancel() {
        this.modal.dismiss(null, 'cancel');
    }

    async confirm() {
        this.modal.dismiss(this.name, 'confirm');
        if(!this.isPermissionGranted?.hasPermission) {
            await this.permissionService.requestForPermissions()
        }
        
    }

    onWillDismiss(event: Event) {
        const ev = event as CustomEvent<OverlayEventDetail<string>>;
        if (ev.detail.role === 'confirm') {
            this.message = `Hello, ${ev.detail.data}!`;
        }
    }

    enterAnimation = (baseEl: HTMLElement) => {
        const root = baseEl.shadowRoot;

        const backdropAnimation = this.animationCtrl
            .create()
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .addElement(root.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = this.animationCtrl
            .create()
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .addElement(root.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' },
            ]);

        return this.animationCtrl
            .create()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    };

    leaveAnimation = (baseEl: HTMLElement) => this.enterAnimation(baseEl).direction('reverse');

    onSwiper(swiper) {
        // console.log(swiper);
    }

    onSlideChange() {
        // console.log('slide change');
    }

    /**
     * Creates a thumbnail from a video file
     *
     * @param fullPath The full path of the file, including the name.
     * @param name The name of the file, without path information.
     * @returns
     */
    private async createThumbnail(fullPath: string, name: string) {

        const thumbnailName = `tnl-${name.replace(/\.[^/.]+$/, '')}`;
        return await this.videoEditor.createThumbnail({

            fileUri: fullPath,
            outputFileName: `tnl-${name.replace(/\.[^/.]+$/, '')}`, //`tb-${name.toLowerCase()}`,
            atTime: 1,
            width: 320,
            height: 480,
            quality: 100,

        }).then(thumbnail => {

            const thumbnailName = thumbnail.substring(thumbnail.lastIndexOf('/') + 1);
            console.log(`thumbnailName:${thumbnailName}`, `created thumbnail: ${thumbnail}`);
            return { thumbnail, thumbnailName };
        }).catch(async err => {

            console.error('thumbnail creation error:', err);
            throw err;
        });
    }

    /**
     * Returns the path of the transcoded video file.
     *
     * @param fullPath The full path of the file, including the name.
     * @param name The name of the file, without path information.
     * @param width default to 640px
     * @param height default to 640px
     */
    private async transcodeVideo(fullPath: string, name: string, width = 640, height = 640) {

        let outputFileType = this.videoEditorOptions.OutputFileType.MPEG4; // default to android
        if (this.permissionService.CurrentPlatform === DevicePlatform.IOS) {
            outputFileType = this.videoEditorOptions.OutputFileType.QUICK_TIME;
        }

        /** Transcoding video file for compression */
        return await this.videoEditor.transcodeVideo({

            fileUri: fullPath,
            outputFileName: 'tc-' + name.replace(/\.[^/.]+$/, ''),
            outputFileType,
            optimizeForNetworkUse: this.videoEditorOptions.OptimizeForNetworkUse.YES,
            saveToLibrary: true,
            maintainAspectRatio: true,
            width,
            height,
            videoBitrate: 1000000, // 1 megabit
            audioChannels: 2,
            audioSampleRate: 44100,
            audioBitrate: 128000, // 128 kilobits

        }).then((transcodedVideoPath) => {

            console.log('transcoded video file:', transcodedVideoPath);
            return transcodedVideoPath;

        }).catch(async err => {

            console.error('video transcoding error:', err);
            throw err;
        });
    }

    /**
     * Returns the camera options to be provided to choose a picture from
     * device gallery.
     *
     * @returns
     */
    // private cameraOptions() {

    //     let destinationType = this.camera.DestinationType.FILE_URI; // default to android
    //     if (this.permissionService.CurrentPlatform == DevicePlatform.IOS) {
    //         destinationType = this.camera.DestinationType.NATIVE_URI; // for iOS
    //     }
    //     const cameraOptions: CameraOptions = {
    //         quality: 25,
    //         cameraDirection: this.camera.Direction.BACK, // back camera,
    //         /* targetWidth: 600,
    //         targetHeight: 600, */
    //         encodingType: this.camera.EncodingType.PNG,
    //         sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    //         destinationType,
    //         //allowEdit: true,
    //         mediaType: this.camera.MediaType.ALLMEDIA,
    //     };
    //     return cameraOptions;
    // }

    /**
     * Formats an image path on the device to be displayed in a thumbnail.
     *
     * @param imagePath
     * @returns
     */
    private sanitizedPathForImage(imagePath: string) {

        return (!imagePath) ? '' : this.webview.convertFileSrc(imagePath);
    }

    /**
     * checks for allowed video formats by the codova-media-capture plugin
     *
     * @param type
     * @returns
     */
    private allowedVideoFormats(type: any) {

        return (type === ALLOWED_VIDEO_MIME_TYPE_MOV || type === ALLOWED_VIDEO_MIME_TYPE_MP4 || type === ALLOWED_VIDEO_MIME_TYPE_3GPP);
    }

    /**
     * checks for allowed image formats by the codova-media-capture plugin
     *
     * @param type
     * @returns
     */
    private allowedImageFormats(type: any) {

        return (type === ALLOWED_IMAGE_MIME_TYPE_PNG || type === ALLOWED_IMAGE_MIME_TYPE_JPG || type === ALLOWED_IMAGE_MIME_TYPE_JPEG);
    }

    private async throwAlert(alertController: AlertController, subHeader: string, err: any) {

        const alert = await this.alertController.create({
            header: 'Exception',
            subHeader,
            message: err.message || err,
            buttons: ['REPORT'],
        });
        await alert.present();
    }


    /**
     * Present the action items for a selected media file
     *
     * @param index
     * @param clickedItem
     */
    async presentActionSheet(index, clickedItem) {

        const isVideoFile = this.allowedVideoFormats(clickedItem.type);
        const header = `What do you want to do with this ${isVideoFile ? 'video' : 'image'}?`;

        const actionSheet = await this.actionSheetController.create({

            //header: `${clickedItem.name}`,
            header,
            cssClass: 'my-custom-class',
            buttons: [
                {
                    text: isVideoFile ? 'Play' : 'View',
                    //icon: 'caret-forward-circle',
                    data: {
                        type: 'play'
                    },
                    handler: () => {
                        console.log('Play clicked', index);
                        if (isVideoFile) {
                            this.playVideo(index);
                        } else {
                            this.openImage(index);
                        }

                    }
                },
                {
                    text: 'Delete it',
                    role: 'destructive',
                    //icon: 'trash',
                    id: 'delete-button',
                    data: {
                        type: 'delete'
                    },
                    handler: () => {
                        console.log('Delete clicked', clickedItem);
                        this.remove(index, isVideoFile ? 'video' : 'image');
                    }
                },
                {
                    text: 'Cancel',
                    icon: 'close',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }]
        });
        await actionSheet.present();

        const { role, data } = await actionSheet.onDidDismiss();
        console.log('onDidDismiss resolved with role and data', role, data);
    }

    /* deleteUploadedItem(index, clickedItem) {
      console.log('deleteUploadedItem', index, clickedItem);
      if(clickedItem.type === 'video/mp4') {
          this.videoList = this.videoList.filter(i => i.name !== clickedItem.name);
      } else {
          this.imageList = this.imageList.filter(i => i.name !== clickedItem.name);
      }
    } */
}
