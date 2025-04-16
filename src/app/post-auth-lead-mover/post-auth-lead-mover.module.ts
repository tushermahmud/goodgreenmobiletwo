import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostAuthLeadMoverRoutingModule } from './post-auth-lead-mover-routing.module';
import { PostAuthLeadMoverComponent } from './post-auth-lead-mover.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { EmployeeJobDetailsModule } from '../shared/modules/employee-job-details/employee-job-details.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeDashboardModule } from './employee-dashboard/employee-dashboard.module';
import { EmployeeJobsModule } from './employee-jobs/employee-jobs.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { MediaUploadService } from '../core/services/media-upload/media-upload.service';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { EmployeeNotificationsModule } from './employee-notifications/employee-notifications.module';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { StreamingMedia } from '@awesome-cordova-plugins/streaming-media/ngx';
import { TimeOffsComponent } from '../shared/modules/time-offs/time-offs.component';
import { JobHistoryComponent } from '../shared/modules/job-history/job-history.component';
import { TimeOffsModule } from '../shared/modules/time-offs/time-offs.module';
import { JobHistoryModule } from '../shared/modules/job-history/job-history.module';
import { VideoEditor } from '@awesome-cordova-plugins/video-editor/ngx';
import { OngoingJobsModule } from '../shared/modules/ongoing-jobs/ongoing-jobs.module';
import { MediaStreamingService } from '../core/services/media-streaming/media-streaming.service';


@NgModule({
  declarations: [
    PostAuthLeadMoverComponent,
    // TimeOffsComponent,
    // JobHistoryComponent
    // EmployeeDashboardComponent,
    // EmployeeJobsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    PostAuthLeadMoverRoutingModule,
    EmployeeJobDetailsModule,
    EmployeeDashboardModule,
    EmployeeJobsModule,
    EmployeeProfileModule,
    EmployeeNotificationsModule,
    TimeOffsModule,
    JobHistoryModule,
    OngoingJobsModule
  ],
  providers: [
    Geolocation, 
    MediaUploadService,
    VideoEditor, 
    PhotoViewer, 
    StreamingMedia,
    MediaStreamingService
  ]
})
export class PostAuthLeadMoverModule { }
