import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignaturePadComponent } from './signature-pad.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared.module';


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
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx'; // You reference this in providers

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    SignaturePadComponent
  ],
  exports: [
    SignaturePadComponent
  ],
  providers:[
    Geolocation,
    Camera,
    WebView,
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
  
})
export class SignaturePadModule {}
