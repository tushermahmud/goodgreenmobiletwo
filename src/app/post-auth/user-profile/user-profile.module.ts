import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { IonicModule } from '@ionic/angular';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { EmailVerificationComponent } from './email-verification/opt-verification.component';


@NgModule({
  declarations: [UserProfileComponent, EmailVerificationComponent],
  imports: [
    CommonModule,
    IonicModule,
    UserProfileRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AppVersion,
    NativeGeocoder,
    Camera,
    File,
    MediaCapture,
    FileTransfer,
    WebView,
    PhotoViewer,
    AndroidPermissions,
    PermissionManagerService,
  ]
})
export class UserProfileModule {}
