import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgentAffiliationsComponent } from './agent-affiliations.component';

const routes: Routes = [
    {
      path: '',
      component: AgentAffiliationsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
}) 

export class AgentAffiliationsRoutingModule { }