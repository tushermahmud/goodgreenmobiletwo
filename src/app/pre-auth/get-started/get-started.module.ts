import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GetStartedRoutingModule } from './get-started-routing.module';
import { GetStartedComponent } from './get-started.component';
import { SwiperModule } from 'swiper/angular';
import { GestureController, IonicModule } from '@ionic/angular';

@NgModule({
  imports: [CommonModule, GetStartedRoutingModule, SwiperModule, IonicModule, GetStartedComponent],
})
export class GetStartedModule {}
