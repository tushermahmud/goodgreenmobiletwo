import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobHistoryComponent } from './job-history.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared.module';
import { JobHistoryRoutingModule } from './job-history-routing.module';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    JobHistoryRoutingModule,
    JobHistoryComponent
  ],
  exports: [
    JobHistoryComponent
  ]
})
export class JobHistoryModule { }
