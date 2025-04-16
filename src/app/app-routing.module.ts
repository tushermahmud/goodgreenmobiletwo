import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { VideoInstructionsComponent } from './auth-independent/video-upload/video-instructions/video-instructions.component';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { LoginGuard } from './core/guards/login/login.guard';
import { PostAuthLeadMoverComponent } from './post-auth-lead-mover/post-auth-lead-mover.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    // canActivate: [LoginGuard],
    loadChildren: () => import('./pre-auth/pre-auth.module').then(m => m.PreAuthModule)
  },
  {
    path: 'iauth',
    loadChildren: () => import('./auth-independent/auth-independent.module').then(m => m.AuthIndependentModule)
  },
  {
    path: 'user',
    canActivate: [LoginGuard],
    loadChildren: () => import('./post-auth/post-auth.module').then(m => m.PostAuthModule)
  },
  {
    path: 'lead',
    canActivate: [LoginGuard],
    // component: PostAuthLeadMoverComponent,
    loadChildren: () => import('./post-auth-lead-mover/post-auth-lead-mover.module').then(m => m.PostAuthLeadMoverModule)
  },
  {
    path: 'agent',
    canActivate: [LoginGuard],
    loadChildren: () => import('./post-auth-agent/post-auth-agent.module').then(m => m.PostAuthAgentModule)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
