import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { Document } from 'src/app/models/job-details.model';
import { environment } from 'src/environments/environment';



const VIEW_TYPE_NA = 'na';
const VIEW_TYPE_QUOTE = 'view-quote';
const VIEW_TYPE_SIGN_CONTRACT = 'sign-contract';
const VIEW_TYPE_CONTRACT = 'view-contract';
const VIEW_TYPE_CHANGE_ORDER = 'change-order';
const VIEW_TYPE_SIGN_CHANGE_ORDER = 'sign-change-order';

@Component({
  selector: 'app-jd-doc-viewer',
  templateUrl: './jd-doc-viewer.component.html',
  styleUrls: ['./jd-doc-viewer.component.css']
})
export class JdDocViewerComponent implements OnInit {

  @Input() doc: Document;
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

	constructor(
		private modalController: ModalController,
		private loaderService: IonLoaderService,
		private _rndr: Renderer2
	) { }


  
	async ngOnInit() {
		await this.loaderService.createLoading(`Please wait while we load your ${this.doc?.type}`)
	
		console.log('doc:', this.doc.filesUrl, this.doc.url);
		console.log('customerId:', this.customerId);
		console.log('contractId:', this.contractId);
		if (this.doc?.type === 'quote') {
			//this.pdfSrc = 'https://dev-gg-marketplace.s3.us-west-2.amazonaws.com/pa/customers/CUST_a618511e-a72a-4a13-9e94-014d05cc69c4/service-request/150/business-accounts/BA_91af610b-1095-41b5-becd-ebb23b9bbba5/documents/quote-2333.pdf';
			this.pdfSrc = this.doc?.url;
			this.navUrl = `${environment.ggWebSpaHost}/document/quote?url=${this.doc.url}`;
			console.log(`quote url:`, this.navUrl);
			this.title = 'Quote';
			this.currentView = VIEW_TYPE_QUOTE;
      		this.loaderService.dismissLoading()
		}	
		else if (this.doc?.type === 'contract') {
			/* if (this.doc.isSigned) {
				this.title = 'Signed Contract';
				this.navUrl = `${environment.ggWebHost}/iauth/document/contract?url=${this.doc.url}`;
				console.log(`contract url:`, this.navUrl);
				this.currentView = VIEW_TYPE_CONTRACT;
        		this.loaderService.dismissLoading();
			}
			else {
				this.title = 'Sign Contract';
				this.navUrl = `${environment.ggWebSpaHost}/iauth/customer/sign-contract?customer-id=${this.customerId}&contract-id=${this.doc.id}&signer=1&type=customer`;
				console.log(`signing url:`, this.navUrl);
				this.currentView = VIEW_TYPE_SIGN_CONTRACT; 
        		this.loaderService.dismissLoading()
			} */

			// for employees, do not allow to sign contract from the app as of now as we do not know if they are authorized (until the logged in user
			// email is checked). For now show the document only.
			this.title = this.doc.isSigned ? 'Signed Contract' : 'Contract'
			this.title = 'Signed Contract';
			this.navUrl = `${environment.ggWebSpaHost}/document/contract?url=${this.doc.url}`;
			console.log(`contract url:`, this.navUrl);
			this.currentView = VIEW_TYPE_CONTRACT;
		} 	
		else if(this.doc?.type === 'change-order') {
			/* if (this.doc.isSigned) {
				this.title = 'Signed Change Order';
				this.navUrl = `${environment.ggWebHost}/iauth/document/change-order?url=${this.doc.url}`;
				console.log(`contract url:`, this.navUrl);
				this.currentView = VIEW_TYPE_CHANGE_ORDER;
        		this.loaderService.dismissLoading()
			}
			else {
				this.title = 'Sign Change Order';
				this.navUrl = `${environment.ggWebSpaHost}/iauth/customer/change-order?change-order-id=${this.doc.id}&signer=2`;
				console.log(`signing url:`, this.navUrl);
				this.currentView = VIEW_TYPE_SIGN_CHANGE_ORDER
        		this.loaderService.dismissLoading()
			} */
			// for employees, do not allow to sign contract from the app as of now as we do not know if they are authorized (until the logged in user
			// email is checked). For now show the document only.
			this.title = this.doc.isSigned ? 'Signed Change Order' : 'Change Order';
			this.navUrl = `${environment.ggWebSpaHost}/document/change-order?url=${this.doc.url}`;
			console.log(`change-order url:`, this.navUrl);
			this.currentView = VIEW_TYPE_CHANGE_ORDER;
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
			await this.loaderService.dismissLoading();
			this.counter = 0
		}

		// this.loaderService.dismissLoading();
	}

}
