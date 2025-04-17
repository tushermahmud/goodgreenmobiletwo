import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Camera } from '@awesome-cordova-plugins/camera/ngx';
//import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { VideoUploadRoutingModule } from './video-upload-routing.module';
import { VideoUploadComponent } from './video-upload.component';
import { VideoInstructionsComponent } from './video-instructions/video-instructions.component';
import { VideoCaptureComponent } from './video-capture/video-capture.component';
import { PickupLocationComponent } from './pickup-location/pickup-location.component';
import { DropLocationComponent } from './drop-location/drop-location.component';
import { ReviewServiceRequestComponent } from './review-service-request/review-service-request.component';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { StreamingMedia } from '@awesome-cordova-plugins/streaming-media/ngx';
import { VideoEditor } from '@awesome-cordova-plugins/video-editor/ngx';
import { AdditionalServicesComponent } from './additional-services/additional-services.component';

import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { SwiperModule } from 'swiper/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@NgModule({
    imports: [
        CommonModule,
        VideoUploadRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        SwiperModule,
        SharedModule,
        VideoUploadComponent,
        VideoInstructionsComponent,
        VideoCaptureComponent,
        PickupLocationComponent,
        DropLocationComponent,
        ReviewServiceRequestComponent,
        AdditionalServicesComponent,
    ],
    providers: [
        WebView,
        Camera,
        File,
        FileTransfer,
        MediaCapture,
        StreamingMedia,
        PhotoViewer,
        NativeGeocoder,
        VideoEditor,
        AndroidPermissions,
        PermissionManagerService,
    ],
})
export class VideoUploadModule { }
