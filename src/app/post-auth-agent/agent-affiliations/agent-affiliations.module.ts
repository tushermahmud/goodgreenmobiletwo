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
  declarations: [
    AgentAffiliationsComponent,
    AffiliationsListComponent,
    InvitationsListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    AgentAffiliationsRoutingModule
  ],
  exports: [
    AgentAffiliationsComponent,
    AffiliationsListComponent,
    InvitationsListComponent
  ]
})
export class AgentAffiliationsModule { }
