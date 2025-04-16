import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeOffsComponent } from './time-offs.component';

const routes: Routes = [
    {
      path: '',
      component: TimeOffsComponent
    }
];
  
@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class TimeOffsRoutingModule { }