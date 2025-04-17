import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeDashboardRoutingModule } from './employee-dashboard-routing.module';
import { EmployeeDashboardComponent } from './employee-dashboard.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule, 
    EmployeeDashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    EmployeeDashboardComponent
  ],
  exports: [
    EmployeeDashboardComponent
  ],
  providers: [Geolocation]
})
export class EmployeeDashboardModule { }
