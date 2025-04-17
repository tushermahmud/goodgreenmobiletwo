/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable id-blacklist */
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Stripe } from '@ionic-native/stripe/ngx';
import { AlertController, IonicModule, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { LoaderService } from 'src/app/core/services/common/loader.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { PaymentUserType } from 'src/app/definitions/payment-user-type.enum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { environment } from 'src/environments/environment';


@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css'],
    standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PaymentComponent implements OnInit {

    paymentAmount = '3.00';
    currency = 'USD';
    currencyIcon = '$';
    cardDetails: any = {};
    bankAccount: any = {};
    paymentMode: 'full' | 'partial' = null;
    paymentLabel = 'Full amount';

    stripeKey = environment.clientStripeKey;
    cardForm: FormGroup;
    paymentType: string = null;
    orderItemData = null;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: true,
        isUserProfileVisible: true,
        headerText: `Payment Details`
    };

    authData: any;
    getAuthState: any;
    itemId: any;
    quoteData: any;
    fullpaymentValue = 0.00; // ngModel
    customPaymentValue = 0.00; // ngModel
    isPaymentClicked: boolean = false
    readonly production = environment.production;
    paymentCustomerId: 'string';
    saveCardChecked: boolean = true;
    isNewCardSelected: boolean = false;
    isSavedCardSelected: boolean = false;
    cardPayload:any;

    constructor(
        private stripe: Stripe,
        private router: Router,
        private actRoute: ActivatedRoute,
        private store: Store<AppState>,
        private commonService: CommonService,
        private navController: NavController,
        private loaderService: IonLoaderService,
        private orderService: OrderService,
        private fb: FormBuilder,
        private alertController: AlertController,
    ) {
        this.getAuthState = this.store.select(selectAuthData);
        this.actRoute.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.itemId = this.router.getCurrentNavigation().extras.state.itemId;
                this.quoteData = this.router.getCurrentNavigation().extras.state.paymentDetails;
            }
        });
    }

    ngOnInit(): void {
        // this.paymentMode = 'full'
        this.quoteData.paidAmount === 0 ? this.paymentMode = 'full' :
            (this.quoteData.paidAmount !== 0 && this.quoteData.paidAmount !== Number(this.quoteData.grandTotal) ? this.paymentMode = 'partial' : this.paymentMode = 'partial');
            // this.fullpaymentValue = Number(this.quoteData.grandTotal) - Number(this.quoteData.paidAmount);
            // this.customPaymentValue = 0;
        if (this.paymentMode === 'full') {
            this.fullpaymentValue = Number(this.quoteData.grandTotal) - Number(this.quoteData.paidAmount);
        } else if (this.quoteData.paidAmount !== 0 && this.quoteData.paidAmount !== Number(this.quoteData.grandTotal)) {
            this.customPaymentValue = Number(this.quoteData.grandTotal) - this.quoteData.paidAmount;
        }

        if (this.quoteData.paidAmount > 0) {
            this.paymentLabel = 'Pending amount'
        }

        this.buildCardForm();
        this.initializeStripe();
        this.getAuthState.subscribe(res => {
            this.authData = res;
        });
        this.commonService.getOrderItemData().subscribe(res => {
            this.orderItemData = res;
        });

        this.getCardInfo(this.authData?.authMeta?.customer?.id);
        this.paymentMode = 'full'

        if(this.paymentMode === 'full') {
            this.fullpaymentValue = Number(this.quoteData.grandTotal) - Number(this.quoteData.paidAmount);
            this.customPaymentValue = 0;
        }
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


    initializeStripe() {
        this.stripe.setPublishableKey(this.stripeKey);
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
        // this.showLoader('please wait while we process your payment...');
        // send this data

        this.cardPayload = {
            number: formValues.cardNumber, // 16-digit credit card number
            expMonth: formValues.cardExpiryMonth, // expiry month
            expYear: formValues.cardExpiryYear, // expiry year
            cvc: formValues.cardCvc, // CVC / CCV
            name: formValues.cardName, // card holder name (optional)
            /* address_line1: '123 Some Street', // address line 1 (optional)
            address_line2: 'Suite #220', // address line 2 (optional)
            address_city: 'Toronto', // city (optional)
            address_state: 'Ontario', // state/province (optional)
            address_country: 'Canada', // country (optional)
            postalCode: 'L5L5L5', // Postal Code / Zip Code (optional)
            currency: 'USD' // Three-letter ISO currency code (optional) */
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
            serviceItemId: this.orderItemData.id,
            baseQuoteId: this.orderItemData.quoteId,
            amount: this.paymentMode === 'full' ? this.fullpaymentValue : this.customPaymentValue,
            currency: 'usd', // default to US dollar as the curreny
            paymentType: this.paymentMode === 'full' ? 'full-payment' : 'partial-payment',
            paymentMethod: 'card',
            token: token.id,
            isCustomerPayment: true,
            paymentBy: PaymentUserType.CUSTOMER,
            paymentByAccId: this.authData?.authMeta?.customer?.accountId,
            saveCard: this.saveCardChecked ? true : false
        };

        console.log(`processPayment:`, JSON.stringify(payload));
        console.log('payload', payload)
        this.processingPayment(this.authData?.authMeta?.customer?.id, payload,this.saveCardChecked);

    }

    paymentSelection(e) {
        console.log('paymentSelection', e);

        const type: 'full' | 'partial' = e.detail.value;

        if (type === 'full') {
            this.fullpaymentValue = Number(this.quoteData.grandTotal) - Number(this.quoteData.paidAmount);
            this.customPaymentValue = 0;
        } else if (type === 'partial') {
            // this.fullpaymentValue = 0;
            // if (this.quoteData.paidAmount !== 0 && this.quoteData.paidAmount !== Number(this.quoteData.grandTotal)) {
            //     this.customPaymentValue = Number(this.quoteData.grandTotal) - this.quoteData.paidAmount;
            // } else {
                
            // }
            // this.paymentAmount = '3.00'; // tbd
            this.customPaymentValue = 0;
        }

    }

    showLoader(msg: string) {
        this.commonService.showLoader('Hello world');
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

        if (this.paymentMode === 'partial') {
            return this.customPaymentValue > 0.5;
        }
        else {
            return true;
        }
    }

    processingPayment(customerId, payload,saveCard) {
        this.orderService.makePayment(customerId, payload).subscribe(async res => {
            console.log('After makePayment res===>>', res);
            await this.loaderService.dismissLoading();
            await this.loaderService.createLoading(`${res.paymentType} is successfully processed.`)
            if (saveCard && res) { await this.saveCardOnSuccessPayment(customerId) }
            // go to dashboard page
            setTimeout(async () => {
                this.isPaymentClicked = false;
                await this.loaderService.dismissLoading();
                this.router.navigate(['user', 'dashboard'], {
                    state: {
                        refresh: true,
                        // serviceItemId: can use this data to open/expand that order item in dashboard
                    }
                });
            }, 2000);
        }, err => {
            this.isPaymentClicked = false;
            this.loaderService.dismissLoading();
            this.alertMessage(err);
            this.commonService.showToast(`Payment failed, please try again.`);
            console.log('err', JSON.stringify(err));
        });
    }


   async makePaymentBySavedCard() {
        await this.loaderService.createLoading('Please wait while we process your payment...');
        const payload = {
            serviceItemId: this.orderItemData.id,
            baseQuoteId: this.orderItemData.quoteId,
            amount: this.paymentMode === 'full' ? this.fullpaymentValue : this.customPaymentValue,
            currency: 'usd', // default to US dollar as the curreny
            paymentType: this.paymentMode === 'full' ? 'full-payment' : 'partial-payment',
            paymentMethod: 'card',
            customerId: this.authData?.authMeta?.customer?.id,
            isCustomerPayment: true,
            paymentBy: PaymentUserType.CUSTOMER,
            paymentByAccId: this.authData?.authMeta?.customer?.accountId,
        }
        console.log('payload', payload)
        this.processingPayment(this.authData?.authMeta?.customer?.id, payload,false);
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


    onSelectCheckBox(event){
        this.saveCardChecked =  event?.detail?.checked
    }


    async saveCardOnSuccessPayment(customerId) {
        this.loaderService.createLoading('Please wait while card is saving')
        let tokenPayload = null;
        await this.stripe.createCardToken(this.cardPayload).then(async token => {
            tokenPayload = { token : token.id}
            console.log('token', tokenPayload)

            this.orderService.saveCard(customerId, tokenPayload).subscribe({
                next: async res => {
                    console.log('response', res);
                    await this.loaderService.dismissLoading();
                    await this.commonService.showToast(`Card saved successfully.`);
                },
                error: async err => {
                    console.log('error', err);
                    this.alertMessage(err);
                    await this.loaderService.dismissLoading();
                    await this.commonService.showToast(`Error while saving card`);
                }
            })
        })
    }


    onInputChange(newValue) {
        console.log(newValue);  
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
