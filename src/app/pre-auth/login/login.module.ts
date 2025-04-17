import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { IonicModule } from '@ionic/angular';
import { LayoutModule } from 'src/app/post-auth/layout/layout.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { Device } from '@ionic-native/device/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';


@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    LayoutModule,
    LoginComponent
  ],
  providers:[
    Device,
    FirebaseX
  ]
})
export class LoginModule { }
