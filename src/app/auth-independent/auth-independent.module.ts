import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthIndependentRoutingModule } from './auth-independent-routing.module';
import { IonicModule } from '@ionic/angular';


@NgModule({

  imports: [
    CommonModule,
    IonicModule,
    AuthIndependentRoutingModule
  ]
})
export class AuthIndependentModule { }
