import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Stripe } from '@ionic-native/stripe/ngx';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-process-payments',
	templateUrl: './process-payments.component.html',
	styleUrls: ['./process-payments.component.css']
})
export class ProcessPaymentsComponent implements OnInit {
	ngOnInit(): void {
		console.log('empty comp, remove it later');
	}
// 	stripeKey = environment.clientStripeKey;
// 	cardForm: FormGroup;
// 	paymentType: string = null;
// 	orderItemData = null;

// 	heraderInfo: GlobalHeaderObject = {
// 		isBackBtnVisible: true,
// 		isnotificationIconVisible: false,
// 		isUserProfileVisible: false,
// 		headerText: `Proceed to Pay`
//  }

// 	authData
// 	getAuthState

// 	constructor(
// 		private activatedRoute: ActivatedRoute,
// 		private fb: FormBuilder,
// 		private router: Router,
// 		private navController: NavController,
// 		private stripe: Stripe,
// 		private store: Store<AppState>,
// 		private toastController: ToastController,
// 		private commonService: CommonService,
// 		private orderService: OrderService,
// 		public loadingController: LoadingController
// 	) {
// 		this.getAuthState = this.store.select(selectAuthData);
// 	}

// 	ngOnInit(): void {

// 		this.buildCardForm();
// 		this.initializeStripe();
// 		this.getAuthState.subscribe(res => {
// 			this.authData = res;
// 		})

// 		this.activatedRoute.paramMap.subscribe(paramMap => {
// 			console.log(paramMap.get('type'));
// 			this.paymentType = paramMap.get('type');
// 			if (this.paymentType === 'card') {
// 				// card view is true
// 				// this.buildCardForm();
// 			} else {
// 				// card view is false
// 			}
// 		})
// 		this.commonService.getOrderItemData().subscribe(res => {
// 			this.orderItemData = res;
// 		})
// 		console.log('orderItemData===>>', this.orderItemData.id);

// 	}

// 	buildCardForm() {
// 		this.cardForm = this.fb.group({
// 			cardNumber: ['4242424242424242', [Validators.required]],
// 			cardName: ['John Smith', [Validators.required]],
// 			cardExpiryMonth: ['12', [Validators.required]],
// 			cardExpiryYear: ['2025', [Validators.required]],
// 			cardCvc: ['220', [Validators.required]]
// 		});
// 	}

// 	initializeStripe() {
// 		this.stripe.setPublishableKey(this.stripeKey);
// 	}

// 	makePayment(formValues) {
// 		console.log('formValues ===>',formValues);
// 		let stripeToken = null;
// 		// if dorm is valid then only process payment
// 		if (!this.cardForm.valid) return;
// 		// this.showLoader('please wait while we process your payment...');
// 		// send this data

// 		const cardPayload = {
// 			number: formValues.cardNumber, // 16-digit credit card number
// 			expMonth: formValues.cardExpiryMonth, // expiry month
// 			expYear: formValues.cardExpiryYear, // expiry year
// 			cvc: formValues.cardCvc, // CVC / CCV
// 			name: formValues.cardName, // card holder name (optional)
// 			address_line1: '123 Some Street', // address line 1 (optional)
// 			address_line2: 'Suite #220', // address line 2 (optional)
// 			address_city: 'Toronto', // city (optional)
// 			address_state: 'Ontario', // state/province (optional)
// 			address_country: 'Canada', // country (optional)
// 			postalCode: 'L5L5L5', // Postal Code / Zip Code (optional)
// 			currency: 'CAD' // Three-letter ISO currency code (optional)
// 		}

// 		this.stripe.createCardToken(cardPayload).then(token => {
// 			stripeToken = token;
// 			this.processPayment(stripeToken);
// 		}).catch(error => {
// 			console.log('error while creating stripe token for card', error);
// 		})

// 		// if (this.paymentType === 'card') {

// 		// } else if (this.paymentType === 'bank') {
// 		// 	const bankPayload = {
// 		// 		routing_number: '11000000',
// 		// 		account_number: '000123456789',
// 		// 		account_holder_name: 'John Smith', // optional
// 		// 		account_holder_type: 'individual', // optional
// 		// 		currency: 'CAD',
// 		// 		country: 'CA'
// 		// 	}

// 		// 	this.stripe.createBankAccountToken(bankPayload).then(token => {
// 		// 		stripeToken = token;
// 		// 		this.processPayment(stripeToken);
// 		// 	}).catch(error => {
// 		// 		console.log('error while creating stripe token for bank', error);
// 		// 	})
// 		// }


// 	}

// 	processPayment(token) {
// 		this.commonService.showLoader('please wait while we process your payment...')
// 		console.log('processPayment token', token);
// 		const payload  = {
// 			serviceItemId: this.orderItemData.id,
// 			baseQuoteId: this.orderItemData.quoteId,
// 			amount: 300,
// 			paymentType: "partial-payment",
// 			paymentMethod: this.paymentType,
// 			token: token.id
// 		}
// 		this.orderService.makePayment(this.authData?.user?.customer?.id , payload).subscribe(res => {
// 			console.log('After makePayment res===>>', res);
// 			this.commonService.showToast(`${res.paymentType} is successfully processed.`);

// 			this.commonService.hideLoader();
// 			// go to dashboard page
// 			setTimeout(() => {
// 				this.router.navigate(['user', 'dashboard']);
// 			} , 3000);
// 		})

// 	}

// 	onCancle() {
// 		this.cardForm.reset();
// 		// go back to payments page
// 		this.navController.back();
// 	}

// 	goBack(){
// 		this.onCancle();
// 	}


// 	ngOnDestroy(): void {
// 		//Called once, before the instance is destroyed.
// 		//Add 'implements OnDestroy' to the class.
// 		this.cardForm.reset();
// 	}

}
