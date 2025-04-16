import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignaturePadComponent } from './signature-pad.component';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { StreamingMedia } from '@awesome-cordova-plugins/streaming-media/ngx';
import { VideoEditor } from '@awesome-cordova-plugins/video-editor/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared.module';
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';



@NgModule({
  declarations: [
    SignaturePadComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule
  ],
  providers:[
    Geolocation,
    Camera,
    WebView,
    Camera,
    File,
    FileTransfer,
    MediaCapture,
    StreamingMedia,
    PhotoViewer,
    VideoEditor,
    MediaUploadService,
    AndroidPermissions,
    PermissionManagerService,
    MediaStreamingService
  ],
  exports: [
    SignaturePadComponent
  ]
})
export class SignaturePadModule { }
