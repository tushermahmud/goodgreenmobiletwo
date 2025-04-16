import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdditionalServicesComponent } from './additional-services/additional-services.component';
import { DropLocationComponent } from './drop-location/drop-location.component';
import { PickupLocationComponent } from './pickup-location/pickup-location.component';
import { ReviewServiceRequestComponent } from './review-service-request/review-service-request.component';
import { VideoCaptureComponent } from './video-capture/video-capture.component';
import { VideoInstructionsComponent } from './video-instructions/video-instructions.component';
import { VideoUploadComponent } from './video-upload.component';

const routes: Routes = [
  {
    path: '',
    component: VideoUploadComponent
  },
  {
    path: 'instructions',
    component: VideoInstructionsComponent
  },
  {
    path: 'capture',
    component: VideoCaptureComponent
  },
  {
    path: 'pickup-location',
    component: PickupLocationComponent
  },
  {
    path: 'drop-location',
    component: DropLocationComponent
  },
  {
    path: 'review-service-request',
    component: ReviewServiceRequestComponent
  },
  {
    path: 'additional-services',
    component: AdditionalServicesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoUploadRoutingModule { }
