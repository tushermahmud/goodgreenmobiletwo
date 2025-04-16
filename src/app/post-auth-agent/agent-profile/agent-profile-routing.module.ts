import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentProfileComponent } from './agent-profile.component';

const routes: Routes = [
  {
    path: '',
    component: AgentProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentProfileRoutingModule { }
