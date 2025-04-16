import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeJobDetailsComponent } from './employee-job-details.component';

const routes: Routes = [
    {
      path: '',
      component: EmployeeJobDetailsComponent
    }
];
  
@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class EmployeeJobDetailsRoutingModule { }