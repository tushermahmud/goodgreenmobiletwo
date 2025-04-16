import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OngoingJobsComponent } from './ongoing-jobs.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared.module';
import { EmployeeJobDetailsModule } from '../employee-job-details/employee-job-details.module';



@NgModule({
  declarations: [
    OngoingJobsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    EmployeeJobDetailsModule
  ],
  exports:[
    OngoingJobsComponent
  ]
})
export class OngoingJobsModule { }
