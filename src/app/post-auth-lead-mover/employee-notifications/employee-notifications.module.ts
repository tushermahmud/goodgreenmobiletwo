import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeNotificationsComponent } from './employee-notifications.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TimeOffsModule } from 'src/app/shared/modules/time-offs/time-offs.module';
import { EmployeeNotificationsRoutingModule } from './employee-notifications-routing.module';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    EmployeeNotificationsRoutingModule,
    EmployeeNotificationsComponent
    // TimeOffsModule
  ]
})
export class EmployeeNotificationsModule { }
