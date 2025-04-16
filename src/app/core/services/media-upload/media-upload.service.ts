/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { CaptureError, CaptureVideoOptions, MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { VideoEditor } from '@awesome-cordova-plugins/video-editor/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { DevicePlatform } from 'src/app/definitions/device-platform.enum';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { AppSettings } from '../../utils/app-settings';
import { CommonService } from '../common/common.service';
import { LoaderService } from '../common/loader.service';
import { PermissionManagerService } from '../permissions/permission-manager.service';
import { IonLoaderService } from '../ion-loader/ion-loader.service';

interface SelectedFile {
    name: string;
    localURL: string;
    type: string;
    lastModified: number;
    lastModifiedDate: number;
    size: number;
    start?: number;
    end?: number;
    fullPath: string;
    thumbnailFile?: string;
    thumbnail?: string;
    thumbnailName?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
const ALLOWED_VIDEO_MIME_TYPE_3GPP = 'video/3gpp';
const ALLOWED_VIDEO_MIME_TYPE_MP4 = 'video/mp4';
const ALLOWED_VIDEO_MIME_TYPE_MOV = 'video/quicktime';
const ALLOWED_IMAGE_MIME_TYPE_JPEG = 'image/jpeg';
const ALLOWED_IMAGE_MIME_TYPE_JPG = 'image/jpg';
const ALLOWED_IMAGE_MIME_TYPE_PNG = 'image/png';



@Injectable({
    providedIn: 'root'
})
export class MediaUploadService {

    public mediaList: any[] = [];
    public mediaTag: string = null;
    public isMediaUploadInProgress: boolean = false;

    private GG_CORE = AppSettings.GG_CORE_ENDPOINT;
    
    authData: AuthState;
    getAuthState: Observable<AuthState>;

    triggerUpload: BehaviorSubject<any> = new BehaviorSubject(false);
    triggerUploadObs$ = this.triggerUpload.asObservable();
    
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

    private currentCapturedImage: any = null;
    private currentRecordedVideo: any = null;
    private videoOptions: CaptureVideoOptions = { limit: 1, duration: FIFTEEN_MINUTES_IN_SECONDS, quality: 480 };

    constructor(
        private camera: Camera,
        private store: Store<AppState>,
        private alertController: AlertController,
        private webview: WebView,
        private videoEditor: VideoEditor,
        private loaderService: LoaderService,
        private loaderService2: IonLoaderService,
        private file: File,
        private permissionService: PermissionManagerService,
        private commonService: CommonService,
        private mediaCapture: MediaCapture,
        public loadingController: LoadingController,
    ) { 
        this.getAuthState = this.store.select(selectAuthData);
        this.getAuthState.subscribe((authData) => {
            this.authData = authData;
        });
    }

    async initiateUpload(selectedVideos: any[], selectedImages: any[], customerId: string, serviceRequestId: number) {

    }

    /**
     * Selects an image or video existing from the device's gallery and upload it to s3
     */
     async selectAndUploadMediaFromGallery(componentName: string, autoUpload?:boolean, meta?:any) {
        this.mediaList.length > 0 ? this.mediaList.length = 0 : this.mediaList;
        // await this.loaderService2.createLoading('select media..')
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
                    let selectedFile:File = null;

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
                        let loader = null;

                        if (this.allowedVideoFormats(data.type)) {

                            // loader = await this.loaderService.showLoader('Optimizing video file');

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
                            selectedFile = selectedVideo;

                            meta && meta.tag ? this.mediaTag = meta.tag : null; 

                            if(autoUpload) {
                                this.mediaList.push(selectedVideo);
                                this.upload(selectedVideo, componentName);
                                // this.commonService.announceUploadCompleted(true)
                                // this.mediaList = [...this.mediaList];
                            }else {
                                this.mediaList.push(selectedVideo);
                                // this.mediaList = [...this.mediaList];
                                // this.commonService.announceUploadCompleted(true)
                            }
                            // await this.loaderService2.dismissLoading();
                        } else if (this.allowedImageFormats(data.type)) {

                            // loader = await this.loaderService.showLoader('Optimizing image file');
                            const selectedImage = data;
                            selectedImage['thumbnail'] = this.sanitizedPathForImage(data.fullPath);
                            console.log('selectedImage info:', JSON.stringify(selectedImage));
                            selectedFile = selectedImage;
                            meta && meta.tag ? this.mediaTag = meta.tag : null; 
                            if(autoUpload) {
                                this.mediaList.push(selectedImage);
                                // await this.loaderService2.dismissLoading();
                                this.upload(selectedImage, componentName);
                                // this.mediaList = [...this.mediaList];
                                // this.commonService.announceUploadCompleted(true)
                            }else {
                                this.mediaList.push(selectedImage);
                                // await this.loaderService2.dismissLoading();
                                // this.mediaList = [...this.mediaList];
                                // this.commonService.announceUploadCompleted(true)
                                // return true
                            }
                            
                            console.log('mediaList info:', this.mediaList)
                        } else {
                            // await this.loaderService2.dismissLoading();
                            const subheader = `Unsupported format - ${data.type}`;
                            await this.throwAlert(this.alertController, subheader, new Error('This file is not supported, please choose another one.'));
                        }
                        
                        // await this.loadingController.dismiss()
                        // await this.loaderService2.dismissLoading();
                       
                    });
                }
            },
            async (err) => {
                console.log(`error picking media file from gallery:`, JSON.stringify(err));
                await this.loaderService2.dismissLoading();
                throw err;
            }
        ).catch(async err => {
            console.log(`error picking media file from gallery:`, JSON.stringify(err));
            await this.loaderService2.dismissLoading();
            //await this.throwAlert(this.alertController, 'Select Media Failed', err);
        });
      

     }

    async upload(file: SelectedFile, componentName) {
        console.log('FILE TO UPLOAD', file, componentName);
        // this.loaderService.showLoader('uploading media.')
        // await this.loadingController.create({message:'uploading media.'})
        if(file && (file.type.includes('image') || file.type.includes('video') ) && !this.isMediaUploadInProgress ) {
            console.log('CHECK PASSED', file, componentName);
            this.triggerUpload.next({
                upload: true,
                componentName: componentName
            });
            // this.triggerUpload.complete();
        }
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
     * Formats an image path on the device to be displayed in a thumbnail.
     *
     * @param imagePath
     * @returns
     */
    private sanitizedPathForImage(imagePath: string) {

    return (!imagePath) ? '' : this.webview.convertFileSrc(imagePath);
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
    * Captures image from the device's camera
    */
    async captureImage(componentName?:string) {

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
                this.mediaList.push(this.currentCapturedImage);
                console.log('componentName', componentName);
                this.upload(this.currentCapturedImage, componentName);
                console.log('this.mediaList', this.mediaList);
                
                // this.cd.detectChanges();
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
    async captureVideo(componentName?:string) {

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
            this.mediaList.push(this.currentRecordedVideo);
            this.upload(this.currentRecordedVideo, componentName);
            // this.cd.detectChanges();
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

    
    async presentLoader(message: string) {

        const loading = await this.loadingController.create({
            cssClass: 'my-custom-class',
            message,
        });
        loading.present();
        console.log('Loading displayed!');
        return loading;
    }
}
