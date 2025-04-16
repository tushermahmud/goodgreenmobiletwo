import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentProfileRoutingModule } from './agent-profile-routing.module';
import { AgentProfileComponent } from './agent-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';


@NgModule({
  declarations: [
    AgentProfileComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgentProfileRoutingModule,
    IonicModule,
    SharedModule,
    // HeaderComponent
  ],
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
  ],
  exports: [
    AgentProfileComponent
  ]
})
export class AgentProfileModule { }
