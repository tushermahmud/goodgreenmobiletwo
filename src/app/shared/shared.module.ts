import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import Standalone Components and Pipes
import { SafePipe } from '../core/pipes/safe-url.pipe';
import { JobStatusPipe } from '../core/pipes/job-status.pipe';
import { ReplaceHyphenPipe } from '../core/pipes/replace-hyphen.pipe';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { OrderStatusComponent } from './components/order-status/order-status.component';
import { HeaderComponent } from './components/header/header.component';
import { ServiceDocumentsComponent } from './components/service-documents/service-documents.component';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { AddAddendumComponent } from './components/add-addendum/add-addendum.component';
import { JdAddMediaComponent } from './components/jd-add-media/jd-add-media.component';
import { JobLogsComponent } from './components/job-logs/job-logs.component';
import { JdDocViewerComponent } from './components/jd-doc-viewer/jd-doc-viewer.component';
import { JobPaymentsComponent } from './components/job-payments/job-payments.component';
import { AddendumBuilderComponent } from './components/addendum-builder/addendum-builder.component';
import { CurrentJobCardComponent } from './components/current-job-card/current-job-card.component';
import { OrderViewComponent } from './components/order-view/order-view.component';
import { RequestTimeoffComponent } from './components/request-timeoff/request-timeoff.component';
import { AddLocationComponent } from './components/add-location/add-location.component';

import { StreamingMedia } from '@awesome-cordova-plugins/streaming-media/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Stripe } from '@ionic-native/stripe/ngx';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        // Import standalone components and pipes
        NotFoundComponent,
        OrderStatusComponent,
        HeaderComponent,
        ServiceDocumentsComponent,
        DocumentViewerComponent,
        AddAddendumComponent,
        JdAddMediaComponent,
        JobLogsComponent,
        JdDocViewerComponent,
        JobPaymentsComponent,
        AddendumBuilderComponent,
        CurrentJobCardComponent,
        OrderViewComponent,
        RequestTimeoffComponent,
        AddLocationComponent,
        SafePipe,
        JobStatusPipe,
        ReplaceHyphenPipe
    ],
    exports: [
        SafePipe,
        JobStatusPipe,
        NotFoundComponent,
        OrderStatusComponent,
        HeaderComponent,
        ServiceDocumentsComponent,
        DocumentViewerComponent,
        AddAddendumComponent,
        JdAddMediaComponent,
        JobLogsComponent,
        JdDocViewerComponent,
        JobPaymentsComponent,
        AddendumBuilderComponent,
        CurrentJobCardComponent,
        OrderViewComponent,
        RequestTimeoffComponent,
        ReplaceHyphenPipe
    ],
    providers: [
        StreamingMedia,
        PhotoViewer,
        Stripe
    ]
})
export class SharedModule { }
