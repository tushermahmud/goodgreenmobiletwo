import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { IonicModule, NavController, RefresherCustomEvent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { log } from 'console';
import phone from 'phone';
import { Observable } from 'rxjs';
import { AgentService } from 'src/app/core/services/agent/agent.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { ServiceItemState } from 'src/app/definitions/service-item-state.enum';
import { ServiceRequest } from 'src/app/models/agent-sr-details.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { SharedModule } from '../../shared.module';
import { AgentSrDetailsRoutingModule } from './agent-sr-details-routing.module';

@Component({
  standalone: true,
  selector: 'app-agent-sr-details',
  templateUrl: './agent-sr-details.component.html',
  styleUrls: ['./agent-sr-details.component.css'],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    SharedModule,
    AgentSrDetailsRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AgentSrDetailsComponent implements OnInit {

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: true,
    headerText: `Service details`
  };

  serviceItemId: any;
  serviceRequestId: any;

  getAuthState: Observable<AuthState>;
  authData: AuthMeta
  serviceDetailsData: ServiceRequest | any;
  contactDetails: any;
  locationData: any;
  contactFullName: string;
  contactEmail: any;
  contactPhone: any;


  contactDetailsForm: FormGroup;
  totalAmount: any;
  amountPaid: any;
  pendingAmount: number;
  quotesPresent: any;
  quoteDoc: any;
  contractDoc: any;
  showPaymentInfo: any;
  editMode: boolean = false;
  editModeContactDetails: boolean = false;

  refreshEvent: RefresherCustomEvent = null;
  isPhoneValid: boolean = false;

  constructor(
    private actRouter: ActivatedRoute,
    private agentService: AgentService,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private commonService: CommonService,
    private loaderService: IonLoaderService,
    private navController: NavController,
    private mediauploadService: MediaUploadService,
    private router: Router,
    private orderService: OrderService,

  ) {
    this.getAuthState = this.store.select(selectAuthData);
  }

  ngOnInit(): void {

    this.getAuthState.subscribe(authData => {
      this.authData = authData.authMeta;
    });

    this.actRouter.params.subscribe(data => {
      this.serviceItemId = data.serviceItemId;
      this.serviceRequestId = data.serviceRequestId;
    })

    this.contactDetailsForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.required]
    });


    this.getServiceDetails(this.serviceItemId, this.serviceRequestId);


  }

  async getServiceDetails(serviceItemId, serviceRequestId) {
    await this.loaderService.createLoading('Loading service details.')
    console.log('serviceItemId', serviceItemId, 'serviceRequestId', serviceRequestId);
    this.agentService.getServiceDetails(this.authData.agent.id, serviceRequestId, serviceItemId).subscribe({
      next: async (data) => {
        console.log('data', data);
        this.serviceDetailsData = data; // serviceDetailsData was items
        this.contactDetails = { ...data?.contact };
        this.headerInfo.headerText = data.projectName;
        this.locationData = this.serviceDetailsData?.serviceLocations;
        this.contactFullName = `${this.contactDetails.firstname} ${this.contactDetails.lastName}`;
        this.contactEmail = this.contactDetails.email;
        this.contactPhone = this.contactDetails.phoneNumber;

        this.contactDetailsForm = this.fb.group({
          firstname: [this.contactDetails?.firstname, Validators.required],
          lastname: [this.contactDetails?.lastName, Validators.required],
          phoneNumber: [this.contactDetails?.phoneNumber, Validators.required],
          email: [this.contactDetails?.email, Validators.required]
        });

        // quotes
        this.quotesPresent = this.serviceDetailsData.status.state !== ServiceItemState.NEW_REQUEST || this.serviceDetailsData.status.newQuoteReceived;

        // payment details
        this.totalAmount = this.serviceDetailsData.payment.grandTotal;
        this.amountPaid = this.serviceDetailsData.payment.paidAmount;
        this.pendingAmount = Number(this.serviceDetailsData.payment.grandTotal) - this.serviceDetailsData.payment.paidAmount;

        // documents
        if (this.serviceDetailsData.documents.length > 0) {
          this.quoteDoc = this.serviceDetailsData.documents.find(i => i.type === 'quote');
          this.contractDoc = this.serviceDetailsData.documents.find(i => i.type === 'contract');

          // payment option
          // const contractDoc = data.documents.find(d => d.type === 'contract');
          // this.showPaymentInfo = contractDoc && contractDoc.isSigned;

        }

        this.serviceDetailsData = { ...this.serviceDetailsData };
        this.serviceDetailsData.media = [...this.serviceDetailsData.media];
        if (this.locationData) {
          this.commonService.setOrderItemData(this.serviceDetailsData);
        }

        await this.loaderService.dismissLoading()
        console.log('%c Order Details: ', 'background: blue; color: white;', data);

      },
      error: async (error) => {
        console.log('error', error);
        await this.loaderService.dismissLoading()
      },
      complete: () => {
        console.log('complete');

        // this.closeRefreshUi();
      }
    })
  }

  refresh() {
    this.getServiceDetails(this.serviceItemId, this.serviceRequestId);
  }

  handleRefreshFromMedia(event) {
    this.refresh();
  }

  async viewQuotes() {
    // view quotes
    console.log('NEED TO WORK');

    // this.router.navigate(['user', 'dashboard', 'view-quotes', this.serviceItemId]);
  }

  openPaymentsScreen() {
    const navigationExtras: NavigationExtras = {
      state: {
        itemId: this.serviceItemId,
        requestId: this.serviceRequestId,
        custId: this.authData?.agent?.id,
      }
    };

    console.log('NEED TO WORK');
    // this.router.navigate(['user', 'dashboard', 'payment', this.serviceItemId], navigationExtras);
  }

  goBack() {
    this.navController.back();
  }

  editNotes() {
    //when user click on edit icon
    this.editMode = !this.editMode;
  }

  saveNotes() {
    const payload = {
      notes: this.serviceItemId.notes
    };
    console.log('payload', 'Need to Work', payload);

    // this.orderService.updateServiceNotes(this.authData?.authMeta?.customer?.id, this.requestId, this.itemId, payload).subscribe({
    //     next: (res) => {
    //         console.log('notes saved');
    //     },
    //     error: (err) => {
    //         console.log(err);
    //     },
    //     complete: () => {
    //         console.log('updateServiceNotes DONE');

    //     }
    // });
    // console.log('additionalNotes', payload);
    // send this payload to the api, after response

    this.editMode = false;
  };

  editContactDetails() {
    // gets called when user clicks on the edit icon (toggle bte edit and readonly)
    this.editModeContactDetails = !this.editModeContactDetails;
  }


  saveContactDetails(formValues) {
    console.log('formValues', formValues);
    if (!this.contactDetailsForm.valid) return;

    const updatePayload = {
      firstname: formValues.firstname,
      lastname: formValues.lastname,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email
    };
    console.log('updatePayload ===>>>', updatePayload);
    this.orderService.updateOrderContact(this.serviceDetailsData.customerId, this.serviceDetailsData.serviceRequestId, updatePayload).subscribe({
        next: (updatedRes) => {
            // this.store.dispatch(
            //     updateProfileInfo({
            //         payload: updatedRes,
            //     })
            // );
            this.editModeContactDetails = false;
            console.log('updatedRes', updatedRes);
            
            this.commonService.showToast('Customer contact information has been updated!');
        },
        error: (err) => {
            console.log('err===>>>', err);
        },
    });

    this.contactEmail = formValues.email;
    this.contactFullName = formValues.name;
    this.contactPhone = formValues.phoneNumber;
    this.editModeContactDetails = false;
    this.refresh();
  }

  private closeRefreshUi() {

    if (this.refreshEvent) {
      this.refreshEvent.target.complete();
    }
    else {
      this.loaderService.dismissLoading();
    }
  }

  goToPayment() {
    const paymentData = {
      grandTotal: this.serviceDetailsData.payment.grandTotal,
      paidAmount: this.serviceDetailsData.payment.paidAmount
    }
    const navigationExtras: NavigationExtras = {
      state: {
        itemId: this.serviceItemId,
        paymentDetails: paymentData,
        custId: this.authData?.agent?.id,
      }
    };
    console.log('goToPayment navigationExtras', navigationExtras);
    console.log('goToPayment Need to impliment redirect');

    // this.router.navigate(['user', 'dashboard', 'payment', this.serviceItemId], navigationExtras);
  }


  async addMedia() {

    await this.mediauploadService.selectAndUploadMediaFromGallery( this.constructor.name ,true, null);

  }

  //phone number validations
  validateContactPhoneNumber(event) {
    const number = event.target.value;

    try {

      let { phoneNumber, isValid } = phone(number, { country: 'USA' })
      if (isValid) {
        this.contactDetailsForm.controls["phoneNumber"].patchValue(phoneNumber)
        this.isPhoneValid = true;
      }
    } catch (error) {
      console.log(error);
      console.error(error);
    }

  }

  //numeric validation
  alphanumericValidation(event) {
    if (event && String.fromCharCode(event.charCode).match(/[0-9-( )]/)) {
      return event.charCode
    } else {
      return event.preventDefault();
    }
  }

  handlePullRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.getServiceDetails(this.serviceItemId, this.serviceRequestId);
      event.target.complete();
    }, 2000);
  }
}
