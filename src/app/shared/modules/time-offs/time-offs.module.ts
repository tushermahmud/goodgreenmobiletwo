import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeOffsComponent } from './time-offs.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimeOffsRoutingModule } from './time-offs-routing.module';

@NgModule({
  
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TimeOffsRoutingModule
  ]
})
export class TimeOffsModule { }
