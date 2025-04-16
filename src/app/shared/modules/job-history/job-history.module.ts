import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobHistoryComponent } from './job-history.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared.module';
import { JobHistoryRoutingModule } from './job-history-routing.module';



@NgModule({
  declarations: [
    JobHistoryComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    JobHistoryRoutingModule
  ],
  exports: [
    JobHistoryComponent
  ]
})
export class JobHistoryModule { }
