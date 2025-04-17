import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostAuthAgentRoutingModule } from './post-auth-agent-routing.module';
import { PostAuthAgentComponent } from './post-auth-agent.component';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { AgentDashboardModule } from './agent-dashboard/agent-dashboard.module';
import { AgentAffiliationsModule } from './agent-affiliations/agent-affiliations.module';
import { AgentSrDetailsModule } from '../shared/modules/agent-sr-details/agent-sr-details.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    PostAuthAgentRoutingModule,
    AgentDashboardModule,
    AgentAffiliationsModule,
    AgentSrDetailsModule,
    // AgentProfileModule
    PostAuthAgentComponent
  ]
})
export class PostAuthAgentModule { }
