import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailsComponent } from './order-details.component';
import { OrderLogisticsComponent } from './order-logistics/order-logistics.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { LayoutModule } from '../../layout/layout.module';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { StreamingMedia } from '@awesome-cordova-plugins/streaming-media/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { VideoEditor } from '@awesome-cordova-plugins/video-editor/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderMediaComponent } from './order-media/order-media.component';
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';



@NgModule({

  imports: [
    CommonModule,
    SharedModule,
    IonicModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    OrderDetailsComponent,
    OrderLogisticsComponent,
    OrderMediaComponent
  ],
  exports: [
    OrderDetailsComponent,
    OrderLogisticsComponent,
    OrderMediaComponent
  ],
  providers:[
    WebView,
    Camera,
    File,
    FileTransfer,
    MediaCapture,
    StreamingMedia,
    PhotoViewer,
    VideoEditor,
    AndroidPermissions,
    PermissionManagerService,
    MediaUploadService,
    MediaStreamingService
  ]
})
export class OrderDetailsModule { }
