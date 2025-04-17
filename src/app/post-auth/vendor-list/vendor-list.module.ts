import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorListRoutingModule } from './vendor-list-routing.module';
import { VendorListComponent } from './vendor-list.component';
import { LayoutModule } from '../layout/layout.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { IonicModule } from '@ionic/angular';


@NgModule({

  imports: [
    CommonModule,
    VendorListRoutingModule,
    IonicModule,
    SharedModule,
    LayoutModule,
    VendorListComponent
  ]
})
export class VendorListModule { }
