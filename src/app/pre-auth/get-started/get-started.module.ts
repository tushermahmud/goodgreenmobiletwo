import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GetStartedRoutingModule } from './get-started-routing.module';
import { GetStartedComponent } from './get-started.component';
import { SwiperModule } from 'swiper/angular';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [GetStartedComponent],
  imports: [CommonModule, GetStartedRoutingModule, SwiperModule, IonicModule],
})
export class GetStartedModule {}
