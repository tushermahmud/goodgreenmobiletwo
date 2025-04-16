import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddActivityComponent } from './add-activity/add-activity.component';
import { ListOfServicesComponent } from './list-of-services.component';
import { OurServicesSubCategoryComponent } from './our-services-sub-category/our-services-sub-category.component';
import { OurServicesComponent } from './our-services/our-services.component';

const routes: Routes = [
  {
    path: '',
    component: ListOfServicesComponent
  },
  {
    path: 'our-services',
    component: OurServicesComponent
  },
  {
    path: 'our-services-sub-category',
    component: OurServicesSubCategoryComponent
  },
  {
    path: 'add-activity',
    component: AddActivityComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListOfServicesRoutingModule { }
