import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAddendumComponent } from '../shared/components/add-addendum/add-addendum.component';
import { JobLogsComponent } from '../shared/components/job-logs/job-logs.component';
import { JobPaymentsComponent } from '../shared/components/job-payments/job-payments.component';
import { OrderViewComponent } from '../shared/components/order-view/order-view.component';

import { PostAuthLeadMoverComponent } from './post-auth-lead-mover.component';
import { OngoingJobsComponent } from '../shared/modules/ongoing-jobs/ongoing-jobs.component';
import { AuthGuard } from '../core/guards/auth/auth.guard';
import { EmployeeJobDetailsComponent } from '../shared/modules/employee-job-details/employee-job-details.component';

const routes: Routes = [
  {
    path: '',
    component: PostAuthLeadMoverComponent,
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () => import('./employee-dashboard/employee-dashboard.module').then(m => m.EmployeeDashboardModule)
      },
      {
        path: 'employee-dashboard',
        children : [
          {
            path: '',
            canActivate: [AuthGuard],
            loadChildren: () => import('./employee-dashboard/employee-dashboard.module').then(m => m.EmployeeDashboardModule)
          }
        ]
      },
      {
        path: 'employee-jobs',
        children : [
          {
            path: '',
            // component: EmployeeJobsComponent,
            loadChildren: () => import('./employee-jobs/employee-jobs.module').then(m => m.EmployeeJobsModule)
          }
        ]
      },
      {
        path: 'employee-notifications',
        children : [
          {
            path: '',
            // component: EmployeeNotificationsComponent
            loadChildren: () => import('./employee-notifications/employee-notifications.module').then(m => m.EmployeeNotificationsModule)
          }
        ]
      },
      
    ]
    // loadChildren: () => import('./post-auth-lead-mover.component').then(m => m.PostAuthLeadMoverComponent)
  },
  {
    path:'employee-profile',
    // component: EmployeeProfileComponent
    loadChildren: () => import('./employee-profile/employee-profile.module').then(m => m.EmployeeProfileModule)
  },
  {
    path:'employee-jobs/ongoing',
    component:OngoingJobsComponent
  },
  {
    path: 'employee-jobs/job-details',
    component: EmployeeJobDetailsComponent,
    loadChildren: () => import('../shared/modules/employee-job-details/employee-job-details.module').then(m => m.EmployeeJobDetailsModule)

  },
  {
    path: 'employee-jobs/job-details/logs',
    component: JobLogsComponent
  },
  {
    path: 'employee-jobs/job-details/addendum',
    component: AddAddendumComponent
  },
  {
    path: 'employee-jobs/job-details/payments',
    component: JobPaymentsComponent
  },
  {
    path:'order-view/:requestId/:itemId',
    component:OrderViewComponent
  },
  {
    path:'employee-notifications/time-offs',
    loadChildren: () => import('../shared/modules/time-offs/time-offs.module').then(m => m.TimeOffsModule)
  },
  {
    path:'employee-notifications/job-history',
    loadChildren: () => import('../shared/modules/job-history/job-history.module').then(m => m.JobHistoryModule)
  }



  // {
  //   path: 'tabs',
  //   component: TabsPage,
  //   children: [
  //     {
  //       path: 'schedule',
  //       children: [
  //         {
  //           path: '',
  //           loadChildren: '../schedule/schedule.module#ScheduleModule'
  //         }
  //       ]
  //     },
  //     {
  //       path: '',
  //       redirectTo: '/app/tabs/schedule',
  //       pathMatch: 'full'
  //     }
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostAuthLeadMoverRoutingModule { }
