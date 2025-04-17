import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentAffiliationsComponent } from './agent-affiliations.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AffiliationsListComponent } from './affiliations-list/affiliations-list.component';
import { InvitationsListComponent } from './invitations-list/invitations-list.component';
import { AgentAffiliationsRoutingModule } from './agent-affiliations-routing.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    AgentAffiliationsRoutingModule,
    AgentAffiliationsComponent,
    AffiliationsListComponent,
    InvitationsListComponent
  ],
  exports: [
    AgentAffiliationsComponent,
    AffiliationsListComponent,
    InvitationsListComponent
  ]
})
export class AgentAffiliationsModule { }
