import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentDashboardRoutingModule } from './agent-dashboard-routing.module';
import { AgentDashboardComponent } from './agent-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    AgentDashboardRoutingModule,
    AgentDashboardComponent
  ],
  exports: [
    AgentDashboardComponent
  ]
})
export class AgentDashboardModule { }
