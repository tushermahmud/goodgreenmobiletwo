import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./agent-dashboard/agent-dashboard.module').then(m => m.AgentDashboardModule) 
  },
  {
    path: 'agent-dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./agent-dashboard/agent-dashboard.module').then(m => m.AgentDashboardModule)
  },
  {
    path: 'agent-affiliations',
    canActivate: [AuthGuard],
    loadChildren: () => import('./agent-affiliations/agent-affiliations.module').then(m => m.AgentAffiliationsModule)
  },
  {
    path: 'sr-details/:serviceRequestId/sr-item/:serviceItemId', 
    canActivate: [AuthGuard],
    loadChildren: () => import('../shared/modules/agent-sr-details/agent-sr-details.module').then(m => m.AgentSrDetailsModule)
  },
  {
    path: 'agent-profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./agent-profile/agent-profile.module').then(m => m.AgentProfileModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostAuthAgentRoutingModule { }
