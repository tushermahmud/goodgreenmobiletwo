import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


@NgModule({
  imports: [
    CommonModule,
    ChatRoutingModule,
    SharedModule,
    FormsModule,
    IonicModule,
    ChatComponent
  ]
})
export class ChatModule { }
