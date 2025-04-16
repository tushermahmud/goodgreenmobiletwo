import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostAuthRoutingModule } from './post-auth-routing.module';
import { LayoutModule } from './layout/layout.module';
import { SharedModule } from '../shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { EmailVerificationComponent } from './user-profile/email-verification/opt-verification.component';
import { FormBuilder, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicModule,
    PostAuthRoutingModule,
    LayoutModule,
    // FormsModule
  ],
  providers: [FormBuilder],
})
export class PostAuthModule { }
