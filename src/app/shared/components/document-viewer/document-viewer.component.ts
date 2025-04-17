import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { LoaderService } from 'src/app/core/services/common/loader.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { ServiceItemDocument } from 'src/app/models/service-item-document.model';
import { environment } from 'src/environments/environment';
import { SharedModule } from '../../shared.module';
import { CommonModule } from '@angular/common';


const VIEW_TYPE_NA = 'na';
const VIEW_TYPE_QUOTE = 'view-quote';
const VIEW_TYPE_SIGN_CONTRACT = 'sign-contract';
const VIEW_TYPE_CONTRACT = 'view-contract';
const VIEW_TYPE_CHANGE_ORDER = 'change-order';
const VIEW_TYPE_SIGN_CHANGE_ORDER = 'sign-change-order';

@Component({
	selector: 'app-document-viewer',
	templateUrl: './document-viewer.component.html',
	styleUrls: ['./document-viewer.component.css'],
	standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DocumentViewerComponent implements OnInit {

	@Input() doc: ServiceItemDocument;
	@Input() customerId: string;
	@Input() contractId: number;

	@ViewChild('iframe') iframe: ElementRef;
	@ViewChild('iframeContainer') iframeContainer: ElementRef;

	currentView = VIEW_TYPE_NA;
	title = 'Document View';

	// quote as pdf
	private pdfSrc = null;

	// default
	navUrl = 'https://naya.goodgreenapp.com/iauth/quote?url=';

	constructor(
		private modalController: ModalController,
		private loaderService: IonLoaderService,
		private _rndr: Renderer2
	) { }

	page = 1;
	totalPages: number;
	isLoaded = false;
	counter:number = 0;

	afterLoadComplete(pdfData: any) {
		console.log('afterLoadComplete:', pdfData);
		this.totalPages = pdfData.numPages;
		this.isLoaded = true;
	}

	onError(event) {
		console.log('onError:', event);
	}

	nextPage() {
		this.page++;
	}

	prevPage() {
		this.page--;
	}


	async ngOnInit() {
		await this.loaderService.createLoading(`Please wait while we load your ${this.doc?.type}`);
	
		console.log('doc:', this.doc);
		console.log('customerId:', this.customerId);
		console.log('contractId:', this.contractId);
		if (this.doc?.type === 'quote') {
			//this.pdfSrc = 'https://dev-gg-marketplace.s3.us-west-2.amazonaws.com/pa/customers/CUST_a618511e-a72a-4a13-9e94-014d05cc69c4/service-request/150/business-accounts/BA_91af610b-1095-41b5-becd-ebb23b9bbba5/documents/quote-2333.pdf';
			this.pdfSrc = this.doc?.url;
			this.navUrl = `${environment.ggWebSpaHost}/document/quote?url=${this.doc.url}`;
			console.log(`quote url:`, this.navUrl);
			this.title = 'Quote';
			this.currentView = VIEW_TYPE_QUOTE;
		}
		else if (this.doc?.type === 'contract') {
			if (this.doc.isSigned) {
				this.title = 'Signed Contract';
				this.navUrl = `${environment.ggWebSpaHost}/document/contract?url=${this.doc.url}`;
				console.log(`contract url:`, this.navUrl);
				this.currentView = VIEW_TYPE_CONTRACT;
			}
			else {
				this.title = 'Sign Contract';
				this.navUrl = `${environment.ggWebSpaHost}/iauth/customer/sign-contract?customer-id=${this.customerId}&contract-id=${this.doc.id}&signer=1&type=customer`;
				console.log(`signing url:`, this.navUrl);
				this.currentView = VIEW_TYPE_SIGN_CONTRACT;
			}
		}
		else if(this.doc?.type === 'change-order') {
			// if (this.doc.isSigned) {
				this.title = 'Signed Change Order';
				this.navUrl = `${environment.ggWebSpaHost}/document/change-order?url=${this.doc.url}`;
				console.log(`contract url:`, this.navUrl);
				this.currentView = VIEW_TYPE_CHANGE_ORDER;
			// }
			// else {
			// 	this.title = 'Sign Change Order';
			// 	this.navUrl = `${environment.ggWebSpaHost}/iauth/customer/change-order?change-order-id=${this.doc.id}&signer=1`;
			// 	console.log(`signing url:`, this.navUrl);
			// 	this.currentView = VIEW_TYPE_SIGN_CHANGE_ORDER
			// }
		}

		await this.loaderService.dismissLoading();
		console.log('currentView:', this.currentView);
	}

	closeDocViewer() {
		this.modalController.dismiss({
			dismissed: true
		});
	}


	async onLoad() {
		console.log('LOADING DONE');
		this.counter++
		if(this.counter === 2) {
			this.loaderService.dismissLoading();
			this.counter = 0
		}

		// this.loaderService.dismissLoading();
	}

	/* openHelloSign(signedUrl: string) {
		this.client.open(signedUrl, { skipDomainVerification: true, testMode: true, allowCancel: true });
	}; */

	// initialize events and listeners
	/* initializeEvents() {

		this.client.on('sign', (response) => {

			let payload = {
				contractId: this.contractId,
				signerType: "customer",
				signerId: this.customerId
			}

			console.log('data.signatureId', response.signatureId);

			this.authService.onSuccessSignContract(payload).subscribe({
				next: (res) => {
					this.client.close();
					this.infoText = 'Hoooray!! the contract has been signed successfully!!, you will be redirected to dashboard shortly...';
				},
				error: (err) => {
					console.log('err', err);
				}
			})


		});

		this.client.on('error', (error) => {
			this.hasError = true;
			this.client.close();
			this.errObj = error;
			this.messageService.add({ severity: 'error', summary: 'Error', detail: error.code, life: 5000 });
			this.infoText = 'Oops!! looks like there is an error, you will be redirected to dashboard shortly...' + error.code;

		})

		this.client.on('finish', () => {
			console.log('Signature request finished');
			this.client.close();
			this.infoText = 'Hoooray!! the contract has been signed successfully!!, you will be redirected to dashboard shortly...';

		})

		this.client.on('close', () => {

			console.log('Hello sign closed');
			setTimeout(() => {
				this.router.navigate(['']);
			}, 4000)

		})

	}; */

	click = () => {
		console.log('event', 'event');
		
	}

}

