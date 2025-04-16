import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListOfServicesRoutingModule } from './list-of-services-routing.module';
import { ListOfServicesComponent } from './list-of-services.component';
import { OurServicesComponent } from './our-services/our-services.component';
import { OurServicesSubCategoryComponent } from './our-services-sub-category/our-services-sub-category.component';
import { SwiperModule } from 'swiper/angular';
import { AddActivityComponent } from './add-activity/add-activity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ListOfServicesComponent,
    OurServicesComponent,
    OurServicesSubCategoryComponent,
    AddActivityComponent
  ],
  imports: [
    CommonModule,
    ListOfServicesRoutingModule,
    SwiperModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule
  ]
})
export class ListOfServicesModule { }
