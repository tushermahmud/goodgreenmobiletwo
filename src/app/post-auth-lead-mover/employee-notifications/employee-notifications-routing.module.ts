import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeNotificationsComponent } from './employee-notifications.component';

const routes: Routes = [
    {
      path: '',
      component: EmployeeNotificationsComponent
    }
];
  
@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class EmployeeNotificationsRoutingModule { }