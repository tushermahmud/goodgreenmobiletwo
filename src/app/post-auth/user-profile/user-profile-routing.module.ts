import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';
import { EmailVerificationComponent } from './email-verification/opt-verification.component';

const routes: Routes = [

  {
    path: '', 
    component: UserProfileComponent
  },
  {
      path: 'verify-email/:email',
      component: EmailVerificationComponent
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }
