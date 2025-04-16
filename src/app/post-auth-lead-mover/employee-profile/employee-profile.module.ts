import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeProfileComponent } from './employee-profile.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { EmployeeProfileRoutingModule } from './employee-profile-routing.module';
// import { HeaderComponent } from 'src/app/shared/components/header/header.component';



@NgModule({
  declarations: [
    EmployeeProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    EmployeeProfileRoutingModule
  ],
  // exports: [
  //   EmployeeProfileComponent
  // ],
  providers:[
    NativeGeocoder,
    AppVersion,
    NativeGeocoder,
    Camera,
    File,
    MediaCapture,
    WebView,
    AndroidPermissions,
    PermissionManagerService,
  ]
})
export class EmployeeProfileModule { }
