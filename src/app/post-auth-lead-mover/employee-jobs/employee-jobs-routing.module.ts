import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeJobsComponent } from './employee-jobs.component';

const routes: Routes = [
    {
      path: '',
      component: EmployeeJobsComponent
    }
];
  
@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class EmployeeJobsRoutingModule { }