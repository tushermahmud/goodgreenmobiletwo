import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeJobsComponent } from './employee-jobs.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmployeeJobsRoutingModule } from './employee-jobs-routing.module';

@NgModule({
  declarations: [
    EmployeeJobsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    EmployeeJobsRoutingModule
  ],
  exports: [
    EmployeeJobsComponent
  ]
})
export class EmployeeJobsModule { }
