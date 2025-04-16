import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreAuthRoutingModule } from './pre-auth-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PreAuthRoutingModule
  ]
})
export class PreAuthModule { }
