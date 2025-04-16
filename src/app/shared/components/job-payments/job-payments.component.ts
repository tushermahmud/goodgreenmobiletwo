import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Stripe } from '@ionic-native/stripe/ngx';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { PaymentUserType } from 'src/app/definitions/payment-user-type.enum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-job-payments',
  templateUrl: './job-payments.component.html',
  styleUrls: ['./job-payments.component.css']
})
export class JobPaymentsComponent implements OnInit {

  readonly production = environment.production;
  stripeKey = environment.clientStripeKey;

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Payment`,
  };

  cardForm: FormGroup;
  noteForm:FormGroup;
  metaData:any;
  paymentDetails: any;
  paymentMode: 'full' | 'custom'
  fullpaymentValue = 0.00; // ngModel
  customPaymentValue = 0.00; // ngModel
  paymentCustomerId = null;
  saveCardChecked: boolean = true;
  isNewCardSelected: boolean = false;
  isSavedCardSelected: boolean = false;
  cardPayload: any;
  isPaymentClicked: boolean = false
  obj: any;
  mode: 'online' | 'offline';
  isPaymentOnline: boolean = false;
  isPaymentOffline: boolean = false;

 
  constructor(
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private router: Router,
    private fb: FormBuilder,
    private stripe: Stripe,
    private navController: NavController,
    private commonService: CommonService,
    private orderService: OrderService,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController,
  ) {
  }

  ngOnInit(): void {
    this.metaData = this.router.getCurrentNavigation().extras?.state?.meta
    console.log('meta',this.metaData)
    this.obj = {
        businessAccountId: this.metaData?.businessAccountId,
        accountId:this.metaData?.accountId,
        jobCardId: this.metaData?.jobCardId,
        jobId: this.metaData?.jobId,
    }

    this.getPaymentInfo(this.metaData?.businessAccountId,this.metaData?.serviceRequestId, this.metaData?.serviceItemId);
    this.buildCardForm();
    this.buildNoteForm();
    this.getCardInfo(this.metaData?.customerId);
  }

  buildCardForm() {

    // for production do not show test card
    if (this.production) {
      this.cardForm = this.fb.group({
        cardNumber: ['', [Validators.required]],
        cardName: ['', [Validators.required]],
        cardExpiryMonth: ['', [Validators.required]],
        cardExpiryYear: ['', [Validators.required]],
        cardCvc: ['', [Validators.required]]
      });
    }
    else {
      this.cardForm = this.fb.group({
        cardNumber: ['4242424242424242', [Validators.required]],
        cardName: ['John Smith', [Validators.required]],
        cardExpiryMonth: ['12', [Validators.required]],
        cardExpiryYear: ['2025', [Validators.required]],
        cardCvc: ['220', [Validators.required]]
      });
    }
  }


  buildNoteForm() {
    this.noteForm = this.fb.group({
      note: ['', Validators.required]
    })
  }


  initializeStripe() {
    this.stripe.setPublishableKey(this.stripeKey);
  }


  getPaymentInfo(businessAccountId,serviceRequestId, serviceItemId) {
    this.loaderService.createLoading('Loading payment data...')
    this.leadHelperService.getPaymentDetails(businessAccountId,serviceRequestId, serviceItemId).subscribe({
      next: res => {
        this.paymentDetails = { ...res }
        console.log('paymentData', this.paymentDetails);
        this.loaderService.dismissLoading();
        this.reset();

        this.paymentDetails.amountPaid === 0 ? this.paymentMode = 'full' :
          (this.paymentDetails.amountPaid !== 0 && this.paymentDetails.amountPaid !== Number(this.paymentDetails.grandTotal) ? this.paymentMode = 'custom' : this.paymentMode = 'custom');

        if (this.paymentMode === 'full') {
          this.fullpaymentValue = Number(this.paymentDetails.grandTotal) - Number(this.paymentDetails.amountPaid);
        } else if (this.paymentDetails.amountPaid !== 0 && this.paymentDetails.amountPaid !== Number(this.paymentDetails.grandTotal)) {
          this.customPaymentValue = Number(this.paymentDetails.grandTotal) - this.paymentDetails.amountPaid;
        }

        if (this.paymentDetails.paidAmount > 0) {
          // this.paymentLabel = 'Pending amount'
        }

      },
      error: err => {
        console.log('error while fetching data', err);
        this.loaderService.dismissLoading();
        this.alertMessage(err);
      }
    })
  }


  paymentSelection(e) {
    console.log('paymentSelection', e);
    const type: 'full' | 'custom' = e.detail.value;

    if (type === 'full') {
      this.fullpaymentValue = Number(this.paymentDetails.grandTotal) - Number(this.paymentDetails.amountPaid);
      this.customPaymentValue = 0;
    } else if (type === 'custom') {
      this.fullpaymentValue = 0;
      if (this.paymentDetails.amountPaid !== 0 && this.paymentDetails.amountPaid !== Number(this.paymentDetails.grandTotal)) {
        this.customPaymentValue = Number(this.paymentDetails.grandTotal) - this.paymentDetails.amountPaid;
      } else {
        this.customPaymentValue = 0;
      }
    }

  }


  goBack() {
    this.navController.back();
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.cardForm.reset();
  }


  /**
    * Payment amount should be greated than 50cents (USD)
    * @returns 
    */
  validateCustomerPaymentAmount() {

    if (this.paymentMode === 'custom') {
      return this.customPaymentValue > 0.5;
    }
    else {
      return true;
    }
  }


  async makePayment(formValues) {
    console.log('formValues ===>', formValues);
    let stripeToken = null;
    // if dorm is valid then only process payment
    if (!this.cardForm.valid || this.isPaymentClicked) {
      return;
    }
    if (!this.validateCustomerPaymentAmount()) {
      this.commonService.showToast(`Payment value should be a minimum amount of $0.50`);
      return;
    }

    this.isPaymentClicked = true;

    this.cardPayload = {
      number: formValues.cardNumber, // 16-digit credit card number
      expMonth: formValues.cardExpiryMonth, // expiry month
      expYear: formValues.cardExpiryYear, // expiry year
      cvc: formValues.cardCvc, // CVC / CCV
      name: formValues.cardName, // card holder name (optional)
    };

    console.log(`card payload:`, JSON.stringify(this.cardPayload));
    await this.loaderService.createLoading('Please wait while we process your payment...');

    await this.stripe.createCardToken(this.cardPayload).then(async token => {
      stripeToken = token;
      console.log('processPayment token', token);
      this.processPayment(stripeToken);
    }).catch(error => {
      this.isPaymentClicked = false;
      this.loaderService.dismissLoading();
      console.log('error while creating stripe token for card', error);
    });
  }


  processPayment(token) {
    const payload = {
      serviceItemId: this.metaData?.serviceItemId,
      baseQuoteId: this.metaData?.baseQuoteId,
      amount: this.paymentMode === 'full' ? this.fullpaymentValue : this.customPaymentValue,
      currency: 'usd', // default to US dollar as the curreny
      paymentType: this.paymentMode === 'full' ? 'full-payment' : 'partial-payment',
      paymentMethod: 'card',
      token: token.id,
      isCustomerPayment: true,
      paymentBy: PaymentUserType.LEAD,
      paymentByAccId: this.metaData?.accountId,
      saveCard: this.saveCardChecked ? true : false
    };

    console.log(`processPayment:`, JSON.stringify(payload));
    console.log('payload', payload)
    this.processingPayment(this.metaData?.customerId, payload,this.saveCardChecked);

  }

  async makePaymentBySavedCard() {
    if (!this.validateCustomerPaymentAmount()) {
      this.commonService.showToast(`Payment value should be a minimum amount of $0.50`);
      return;
    }
    
    let payload;
    await this.loaderService.createLoading('Please wait while we process your payment...');
    if (this.isPaymentOnline) {
      payload = {
        serviceItemId: this.metaData?.serviceItemId,
        baseQuoteId: this.metaData?.baseQuoteId,
        amount: this.paymentMode === 'full' ? this.fullpaymentValue : this.customPaymentValue,
        currency: 'usd', // default to US dollar as the curreny
        paymentType: this.paymentMode === 'full' ? 'full-payment' : 'partial-payment',
        paymentMethod: 'card',
        customerId: this.metaData?.customerId,
        isCustomerPayment: true,
        paymentBy: PaymentUserType.LEAD,
        paymentByAccId: this.metaData?.accountId,
      }
    }
    else {
      payload = {
        serviceItemId: this.metaData?.serviceItemId,
        baseQuoteId: this.metaData?.baseQuoteId,
        amount: this.paymentMode === 'full' ? this.fullpaymentValue : this.customPaymentValue,
        currency: 'usd', // default to US dollar as the curreny
        paymentType: this.paymentMode === 'full' ? 'full-payment' : 'partial-payment',
        paymentMethod: 'cash',
        customerId: this.metaData?.customerId,
        isCustomerPayment: false,
        paymentBy: PaymentUserType.LEAD,
        paymentByAccId: this.metaData?.accountId,
        remarks:this.noteForm.value.note
      }
    }
    console.log('payload', payload)
    this.processingPayment(this.metaData?.customerId, payload, false);
  }


  processingPayment(customerId, payload, saveCard) {
    this.orderService.makePayment(customerId, payload).subscribe(async res => {
      console.log('After makePayment res===>>', res);
      await this.loaderService.dismissLoading();
      await this.loaderService.createLoading(`${res.paymentType} is successfully processed.`)
      if (saveCard && res) { await this.saveCardOnSuccessPayment(customerId) }
      // go to dashboard page
      setTimeout(async () => {
        this.isPaymentClicked = false;
        await this.loaderService.dismissLoading();
        this.getPaymentInfo(this.metaData?.businessAccountId,this.metaData?.serviceRequestId, this.metaData?.serviceItemId);
      }, 2000);
    }, err => {
      this.isPaymentClicked = false;
      this.loaderService.dismissLoading();
      this.commonService.showToast(`Payment failed, please try again.`);
      console.log('err', JSON.stringify(err));
      this.alertMessage(err);
    });
  }


  async saveCardOnSuccessPayment(customerId) {
    this.loaderService.createLoading('Please wait while card is saving')
    let tokenPayload = null;
    await this.stripe.createCardToken(this.cardPayload).then(async token => {
      tokenPayload = { token: token.id }
      console.log('token', tokenPayload)

      this.orderService.saveCard(customerId, tokenPayload).subscribe({
        next: async res => {
          console.log('response', res);
          await this.loaderService.dismissLoading();
          await this.commonService.showToast(`Card saved successfully.`);
        },
        error: async err => {
          console.log('error', err);
          await this.loaderService.dismissLoading();
          await this.commonService.showToast(`Error while saving card`);
        }
      })
    })
  }


  getCardInfo(customerId) {
    this.orderService.getCardDetails(customerId).subscribe({
      next: async data => {
        console.log(data);
        this.paymentCustomerId = await data.paymentCustomerId
        console.log('paymentCustomerId', this.paymentCustomerId)
        this.paymentCustomerId ? this.saveCardChecked = false : true;
      },
      error: err => {
        console.log(err)
      }
    })
  }


  onSelectCheckBox(event) {
    this.saveCardChecked = event?.detail?.checked
  }


  onSelectSavedCard(event) {
    console.log('saved card', event)
    this.saveCardChecked = event?.detail?.checked
    if (this.saveCardChecked) {
      this.isSavedCardSelected = true;
      this.isNewCardSelected = false;
      this.cardForm.reset();
    }
  }

  addNewCard(event) {
    console.log('new card', event)
    this.saveCardChecked = event?.detail?.checked
    if (this.saveCardChecked) {
      this.isSavedCardSelected = false;
      this.isNewCardSelected = true;
    }
  }


  paymentOption(event){
    console.log('event mode',event)
    if(event?.detail?.value === 'online'){
      this.isPaymentOnline = true;
      this.isPaymentOffline =  false;
      console.log('isPaymentOnline',this.isPaymentOnline)
    }
    else if(event?.detail?.value === 'offline'){
      this.isPaymentOffline = true;
      this.isPaymentOnline = false;
      console.log('isPaymentOffline',this.isPaymentOffline)
    }

    console.log('note',this.noteForm.value)
  }


  async mediaUploadActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Choose supporting documents for payment',
      subHeader: `Offline payment`,
      buttons: [
        {
          text: 'Upload',
          handler: () => {
            // this.uploadMedia();
          }
        },
        {
          text: 'Capture image',
          handler: () => {
            console.log('trigger capture image');
            // this.mediaService.captureImage(this.constructor.name).then(() => {
            // 	console.log('Sent to upload');
            // });
          }

        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();

  }


  reset() {
    this.isPaymentOffline = false;
    this.isPaymentOnline = false
    this.mode = null;
    this.noteForm.reset();
  }


  async alertMessage(message) {
    const alert = await this.alertController.create({
      header: 'Error!',
      message:`${message.error.errorMessage}`,
      buttons:[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () =>{
            this.goBack();
          }
        }
      ]
    })

   await alert.present();
  }
}
