import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';

import { SwiperModule } from 'swiper/angular';
import { ForgotPasswordComponent } from './forgot-password.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [
    CommonModule,
    IonicModule,
    ForgotPasswordRoutingModule,
    SwiperModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ForgotPasswordModule { }
