import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { PaymentComponent } from './payment/payment.component';
import { ProcessPaymentsComponent } from './payment/process-payments/process-payments.component';
import { ServiceRequestDetailComponent } from './service-request-detail/service-request-detail.component';
import { ViewQuotesComponent } from './view-quotes/view-quotes.component';
import { ViewVendorQuoteComponent } from './view-vendor-quote/view-vendor-quote.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'service-request-details/:requestId',
    component: ServiceRequestDetailComponent
  },
  {
    path: 'view-quotes/:itemId',
    component: ViewQuotesComponent
  },
  {
    path: 'view-vendor-quote/:itemId/:quoteId',
    component: ViewVendorQuoteComponent
  },
  {
    path: 'order-details/:requestId/:itemId',
    component: OrderDetailsComponent
  },
  {
    path: 'payment/:itemId',
    component: PaymentComponent
  },
  {
    path: 'payment-details/:type',
    component: ProcessPaymentsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
