import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Stripe } from '@ionic-native/stripe/ngx';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ViewQuotesComponent } from './view-quotes/view-quotes.component';
import { ViewVendorQuoteComponent } from './view-vendor-quote/view-vendor-quote.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ServiceRequestDetailComponent } from './service-request-detail/service-request-detail.component';
import { PaymentComponent } from './payment/payment.component';
import { ProcessPaymentsComponent } from './payment/process-payments/process-payments.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LayoutModule } from '../layout/layout.module';
import { OrderLogisticsComponent } from './order-details/order-logistics/order-logistics.component';
import { StreamingMedia } from '@awesome-cordova-plugins/streaming-media/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { OrderDetailsModule } from './order-details/order-details.module';


@NgModule({
  declarations: [
    //pipe
    DashboardComponent,
    ViewQuotesComponent,
    ViewVendorQuoteComponent,
    ServiceRequestDetailComponent,
    PaymentComponent,
    ProcessPaymentsComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    LayoutModule,
    OrderDetailsModule

  ],
  providers: [Stripe, StreamingMedia, NativeGeocoder, PhotoViewer],
})
export class DashboardModule {}
