import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EmployeeJobDetailsComponent } from './employee-job-details.component';
import { SharedModule } from '../../shared.module';
import { JobLogsComponent } from 'src/app/shared/components/job-logs/job-logs.component';
import { JobLogisticsComponent } from './job-logistics/job-logistics.component';
import { JobMediaComponent } from './job-media/job-media.component';
import { JobDocumentsComponent } from './job-documents/job-documents.component';
import { StreamingMedia } from '@awesome-cordova-plugins/streaming-media/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { SignaturePadModule } from '../signature-pad/signature-pad.module';
import { EmployeeJobDetailsRoutingModule } from './employee-job-details-routing.module';
// import { JobStatusPipe } from 'src/app/core/pipes/job-status.pipe';



@NgModule({
  declarations: [
    // JobStatusPipe, // added this pipe declaration else the job-details view was showing blank
    EmployeeJobDetailsComponent,
    JobLogisticsComponent,
    JobMediaComponent,
    JobDocumentsComponent,
    // JobLogsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    SignaturePadModule,
    EmployeeJobDetailsRoutingModule
  ],
  exports: [
    EmployeeJobDetailsComponent,
    JobLogisticsComponent,
    JobMediaComponent,
    JobDocumentsComponent,
  ],
  providers: [
    FileTransfer,
    File,
    StreamingMedia,
    PhotoViewer,
    MediaUploadService,
    AndroidPermissions,
    PermissionManagerService,
  ]
})
export class EmployeeJobDetailsModule { }
