import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, IonicModule, ModalController, NavController, RefresherCustomEvent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { ServiceItemDocument } from 'src/app/models/service-item-document.model';
import { DocumentViewerComponent } from 'src/app/shared/components/document-viewer/document-viewer.component';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
  selector: 'app-view-vendor-quote',
  templateUrl: './view-vendor-quote.component.html',
  styleUrls: ['./view-vendor-quote.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewVendorQuoteComponent implements OnInit {

  itemId;
  quoteId;
  getAuthState: Observable<AuthState>;
  authData: AuthState;
  quote;
  refreshEvent: RefresherCustomEvent = null;
  documents: ServiceItemDocument[] = null;

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: true,
    isUserProfileVisible: true,
    headerText: `Vendor Details`
  };


  isPaymentPending: boolean = false;
  isContractNotSigned: boolean = false;
  contractId:number;
  customerId:string;
  isContratAvailbale:boolean = false;

  constructor(private loaderService: IonLoaderService,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private navController: NavController,
    public alertController: AlertController,
    public modalController: ModalController,
  ) {
    this.getAuthState = this.store.select(selectAuthData);
  }

  async ngOnInit() {

    this.route.paramMap.subscribe(paramMap => {
      this.itemId = paramMap.get('itemId');
      this.quoteId = paramMap.get('quoteId');
    });
    
    this.getAuthState.subscribe((user) => {
      this.authData = user;
    });
    this.customerId = this.authData?.authMeta?.customer?.id;
    console.log('cus',this.customerId)
    await this.loaderService.createLoading('Fetching quote...');
    this.refreshVendoQuote();
  }

  getQuote() {
    this.orderService.getServiceItemQuoteDetails(this.authData?.authMeta?.customer?.id, this.itemId, this.quoteId).subscribe({
      next:async (res) => {
        console.log('getQuote', res);
        this.quote = res;
        this.documents = res.documents;
        let contract = this.documents.find(doc => doc.type === 'contract')
        contract ? this.isContratAvailbale = true : this.isContratAvailbale = false
        this.documents.forEach(item => {
          if (item?.type === 'contract' && item?.isSigned === false) {
            this.isContractNotSigned = true;
          }
        })
        this.checkPaymentStatus();
        this.closeRefreshUi();
      },
      error: err => {
        console.log(err);
        this.closeRefreshUi();
      },
      complete: () => {
        // this.closeRefreshUi();
      }
    });

  }

  checkPaymentStatus() {
    if(this.quote) {
      this.quote.payments.paidAmount !== Number(this.quote.grandTotal) ? this.isPaymentPending = true : this.isPaymentPending = false;
    } else {
      console.error('Quote data is not available pls try again');
    }
  }

  acceptQuote() {
    if (this.quote?.status === 'accepted') {
      alert('Quote Already Accepted!');
      return;
    }
    const payload = {
      serviceItemId: this.itemId,
      serviceRequestId: 0,
      quoteId: this.quoteId
    };

    this.orderService.acceptServiceItemQuote(this.authData?.authMeta?.customer?.id, this.itemId, payload).subscribe(res => {
      this.quote = res;
      this.getQuote();
      alert('Quote Accepted Successfully!');
    }, err => {
      console.log(err);
      alert('A Quote for this Service is Already Accepted!');
      return;
    });
  }

  openPaymentsScreen(e) {
    const paymentData= {
      grandTotal: this.quote.grandTotal,
      paidAmount: this.quote.payments.paidAmount
    }

    const navigationExtras: NavigationExtras = {
      state: {
          itemId: this.itemId,
          paymentDetails: paymentData,
          custId: this.authData?.authMeta?.customer?.id,
      }
    };

    this.router.navigate(['user', 'dashboard', 'payment', this.itemId], navigationExtras);
      // this.router.navigate(['user', 'dashboard', 'payment', this.itemId]);

  }

  goBack() {
    this.navController.back();
  }

  openDoc() {
    this.presentModal();
  }

  async presentModal() {
    // send id of whatever the item user selects , and call the api related to that document in document viewer component
    const modal = await this.modalController.create({
      component: DocumentViewerComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        documentType: '.pdf',
        docId: 'LKJGB5235151MSZMNCBMNWIU98765'
        //and some extra props if needed
      }
    });

    return await modal.present();
  }

  doRefresh(event) {

    console.log('Begin async operation');
    this.refreshEvent = event;
    this.refreshVendoQuote();
  }

  private refreshVendoQuote() {

    this.getQuote();
  }

  private closeRefreshUi() {

    if (this.refreshEvent) {
      this.refreshEvent.target.complete();
    }
    else {
      this.loaderService.dismissLoading();
    }
  }

  openChat() {
    const navigationExtras: NavigationExtras = {
      state: {
        //  opportunityId: this.item.opportunityId, // pass opportunityId to open Chat
         custId: this.authData?.authMeta?.customer?.id,
      }
   };
   this.router.navigate(['user', 'chat'], navigationExtras);
  }


  checkContractSigned(){
    let docs = [...this.documents]
    console.log('docs',docs)
    docs.forEach(item => {
      if(item?.type === 'contract' && item?.isSigned === false){
        this.contractId = item?.id;
        this.presentDocViewer(item);
      }
    })
    console.log('sign',this.isContractNotSigned)
  }

  async presentDocViewer(document: ServiceItemDocument) {
    console.log('current document:', document);
    // send id of whatever the item user selects, and call the api related to that document in document viewer component
    const modal = await this.modalController.create({
      component: DocumentViewerComponent,
      cssClass: 'my-custom-class',
      canDismiss: true,
      breakpoints: [0, 0.25, 0.5, 1],
      componentProps: {
        doc: document,
        customerId: this.customerId,
        contractId: this.contractId
      }
    });
    return await modal.present();
}

}
