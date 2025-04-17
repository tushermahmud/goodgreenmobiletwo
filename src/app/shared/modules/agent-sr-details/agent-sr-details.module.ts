import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentSrDetailsComponent } from './agent-sr-details.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { AgentServiceDocumetsComponent } from './agent-service-documets/agent-service-documets.component';
import { AgentServiceMediaComponent } from './agent-service-media/agent-service-media.component';
import { AgentServiceLocationsComponent } from './agent-service-locations/agent-service-locations.component';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
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
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';
import { AgentSrDetailsRoutingModule } from './agent-sr-details-routing.module';




@NgModule({
 
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AgentSrDetailsRoutingModule,
    AgentSrDetailsComponent
  ], 
  exports: [
    AgentSrDetailsComponent
  ],
  providers: [
    NativeGeocoder,
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
export class AgentSrDetailsModule { }
