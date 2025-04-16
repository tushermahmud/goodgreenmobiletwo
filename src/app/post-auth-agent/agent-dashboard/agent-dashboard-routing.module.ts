import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentSrDetailsComponent } from 'src/app/shared/modules/agent-sr-details/agent-sr-details.component';
import { AgentDashboardComponent } from './agent-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AgentDashboardComponent
  }, 
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentDashboardRoutingModule { }
