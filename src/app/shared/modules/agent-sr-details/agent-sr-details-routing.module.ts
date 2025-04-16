import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgentSrDetailsComponent } from './agent-sr-details.component';

const routes: Routes = [
    {
      path: '',
      component: AgentSrDetailsComponent
    }
];
  
@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class AgentSrDetailsRoutingModule { }