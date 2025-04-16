import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobHistoryComponent } from "./job-history.component";



const routes: Routes = [
    {
      path: '',
      component: JobHistoryComponent
    }
];
  
@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class JobHistoryRoutingModule { }