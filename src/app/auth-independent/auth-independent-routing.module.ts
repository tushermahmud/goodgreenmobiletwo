import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'list-of-services',
    loadChildren: () => import('./list-of-services/list-of-services.module').then(m => m.ListOfServicesModule)
  },
  {
    path: 'video-upload',
    loadChildren: () => import('./video-upload/video-upload.module').then(m => m.VideoUploadModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthIndependentRoutingModule { }
