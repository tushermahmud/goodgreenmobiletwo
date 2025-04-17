import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import {
    StreamingMedia,
    StreamingVideoOptions,
} from '@awesome-cordova-plugins/streaming-media/ngx';
import {
    IonicModule,
    ModalController,
    NavController,
    RefresherCustomEvent,
} from '@ionic/angular';
import { Store } from '@ngrx/store';
import phone from 'phone';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { DevicePlatform } from 'src/app/definitions/device-platform.enum';
import { ServiceItemState } from 'src/app/definitions/service-item-state.enum';
import { CustomerServiceItem } from 'src/app/models/customer-service-item.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { ServiceItemDocument } from 'src/app/models/service-item-document.model';
import { AppState } from 'src/app/state/app.state';
import { updateProfileInfo } from 'src/app/state/auth/auth.actions';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
    selector: 'app-order-details',
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.css'],
    standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrderDetailsComponent implements OnInit {
    // the service-request id
    requestId;
    // the service-item id
    itemId;
    getAuthState: Observable<AuthState>;
    authData: AuthState;
    item: CustomerServiceItem;
    contactEmail: string;
    contactFullName: string;
    canChat = false;
    contactPhone: string;
    quotesPresent = false;
    quoteDoc: ServiceItemDocument = null;
    contractDoc: ServiceItemDocument = null;
    contact:any;

    // pickep drop form vars
    pickupForm;
    locationData: any;
    // payment details
    payments:any;
    totalAmount = 0;
    amountPaid = 0;
    pendingAmount = 0;
    addendumAmount = 0;
    showPaymentInfo = false;

    headerInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: true,
        isUserProfileVisible: true,
        headerText: `Order Details`
    };
    editMode = false;
    editModeLogistics = false;
    editModeContactDetails = false;
    isPhoneValid:boolean = false;

    refreshEvent: RefresherCustomEvent = null;
    contactDetailsForm: FormGroup;

    private streamingMediaOptions: StreamingVideoOptions = {
        successCallback: () => {
            console.log('Video played');
        },
        errorCallback: (e) => {
            console.log(JSON.stringify(e));
        },
        // orientation: 'landscape',
        shouldAutoClose: false,
        controls: true,
    };

    constructor(public modalController: ModalController,
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private router: Router,
        private orderService: OrderService,
        private navController: NavController,
        private commonService: CommonService,
        private loaderService: IonLoaderService,
        private fb: FormBuilder,
        private streamingMedia: StreamingMedia,
        private photoViewer: PhotoViewer,
        private mediauploadService: MediaUploadService,
        private fileTransfer: FileTransfer,
        private camera: Camera,
        private authService:AuthService,
        private permissionService: PermissionManagerService,) {
        this.getAuthState = this.store.select(selectAuthData);
    }

    async ngOnInit() {

        await this.loaderService.createLoading('Loading order details...');

        this.route.paramMap.subscribe(paramMap => {
            this.requestId = paramMap.get('requestId');
            this.itemId = paramMap.get('itemId');
        });

        this.getAuthState.subscribe((authState) => {
            this.authData = authState;
            console.log('authData:', this.authData);
        });

       
        this.contactDetailsForm = this.fb.group({
            firstname: [this.authData?.authMeta?.customer?.firstname, Validators.required],
            lastname:[this.authData?.authMeta?.customer?.lastname, Validators.required],
            phoneNumber: [this.authData?.authMeta?.customer?.phoneNumber, Validators.required],
            email: [this.authData?.authMeta?.customer?.email, Validators.required]
        });

        this.refreshOrderDetails();
    };
    
   

    getOrderDetails(isLoading?:boolean) {
        isLoading ? this.loaderService.createLoading('Loading order details.') : false;
        this.orderService.getServiceItem(this.authData?.authMeta?.customer?.id, this.requestId, this.itemId).subscribe({
            next: async (res) => {
                this.item = res;
                this.contact = {...res?.contact}
                console.log('this.item', this.item);
                this.headerInfo.headerText = res.projectName;
                this.locationData = this.item?.serviceLocations;
                this.contactFullName = `${this.contact.firstname} ${this.contact.lastName}`;
                this.contactEmail = this.contact.email;
                this.contactPhone = this.contact.phoneNumber;

                this.contactDetailsForm = this.fb.group({
                    firstname: [this.contact?.firstname, Validators.required],
                    lastname:[this.contact?.lastName, Validators.required],
                    phoneNumber: [this.contact?.phoneNumber, Validators.required],
                    email: [this.contact?.email, Validators.required]
                });

                // payment details
                this.payments = { ...this.item?.payment }
                this.totalAmount = this.payments?.grandTotal;
                this.amountPaid = this.payments?.paidAmount;
                this.addendumAmount = this.payments?.addendumAmount;
                this.pendingAmount = (this.item.payment.grandTotal) - this.item.payment.paidAmount;
                // chat option - HIDE CHAT for now
                /* this.canChat = (this.item.status.state !== ServiceItemState.NEW_REQUEST &&
                    this.item.status.state !== ServiceItemState.QUOTES_RECEIVED); */
                // quotes
                this.quotesPresent = this.item.status.state !== ServiceItemState.NEW_REQUEST || this.item.status.newQuoteReceived;
                // documents
                if (this.item.documents.length > 0) {
                    this.quoteDoc = this.item.documents.find(i => i.type === 'quote');
                    this.contractDoc = this.item.documents.find(i => i.type === 'contract');

                    // payment option
                    const contractDoc = res.documents.find(d => d.type === 'contract');
                    this.showPaymentInfo = contractDoc && contractDoc.isSigned;
                }

                

                this.item  = {...this.item};
                this.item.media = [...this.item.media]
                if(this.locationData) {
                    this.commonService.setOrderItemData(this.item);
                }
                //this.item.serviceNote = "This dummy service note is coming as static data for now, from TS file, but eventually will come from backend. If this data does not come from backend, then this section will not be shown at all.";
                
                // this.item.serviceNote = "This dummy service note is coming as static data for now, from TS file, but eventually will come from backend. If this data does not come from backend, then this section will not be shown at all.";
                
                await this.loaderService.dismissLoading()
                console.log('%c Order Details: ', 'background: blue; color: white;', res);

               
            },
            error: err => {
                console.log(err);
                isLoading || err ? this.loaderService.dismissLoading() : false;
            },
            complete: () => {
                this.closeRefreshUi();
            }
        });
    };

    async viewQuotes() {
        // view quotes
        this.router.navigate(['user', 'dashboard', 'view-quotes', this.itemId]);

        // const modal = await this.modalController.create({
        //    component: OrderStatusComponent,
        //    cssClass: 's-modal',
        //    // cssClass: 's-modal s-modal--order-completed',
        //    componentProps: {
        //       title: 'Model Title'
        //    }
        // });
        // modal.onDidDismiss().then((modelData) => {
        //    if (modelData !== null) {
        //       // this.modelData = modelData.data;
        //       console.log('Modal Data : ' + modelData.data);
        //    }
        // });
        // return await modal.present();
    }

    openPaymentsScreen() {
        const navigationExtras: NavigationExtras = {
            state: {
                itemId: this.itemId,
                requestId: this.requestId,
                custId: this.authData?.authMeta?.customer?.id,
            }
        };
        this.router.navigate(['user', 'dashboard', 'payment', this.itemId], navigationExtras);
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
            notes: this.item.notes
        };

        this.orderService.updateServiceNotes(this.authData?.authMeta?.customer?.id, this.requestId, this.itemId, payload).subscribe({
            next: (res) => {
                console.log('notes saved');
            },
            error: (err) => {
                console.log(err);
            },
            complete: () => {
                console.log('updateServiceNotes DONE');

            }
        });
        console.log('additionalNotes', payload);
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
        this.orderService.updateOrderContact(this.authData?.authMeta?.customer.id, this.requestId, updatePayload).subscribe({
            next: (updatedRes) => {
                this.store.dispatch(
                    updateProfileInfo({
                        payload: updatedRes,
                    })
                );
                this.commonService.showToast('Contact information has been updated!');
            },
            error: (err) => {
                console.log('err===>>>', err);
            },
        });
        
        this.contactEmail = formValues.email;
        this.contactFullName = formValues.name;
        this.contactPhone = formValues.phoneNumber;
        this.editModeContactDetails = false;
        this.refreshOrderDetails(true);
    }


    /* async presentDocViewer(document: any) {

        console.log('current customerId:', this.authData.authMeta.customer.id);
        console.log('current contractId:', this.item.contractId);
        console.log('current document:', document);


        // send id of whatever the item user selects, and call the api related to that document in document viewer component
        const modal = await this.modalController.create({
            component: DocumentViewerComponent,
            cssClass: 'my-custom-class',
            canDismiss: true,
            breakpoints: [0, 0.25, 0.5, 1],
            componentProps: {
                doc: document,
                customerId: this.authData.authMeta.customer.id,
                contractId: this.item.contractId
                //and some extra props if needed
            }
        });
        return await modal.present();
    } */

    // Order details refresher
    doRefresh(event) {
        console.log('Begin async operation');
        this.refreshEvent = event;
        this.refreshOrderDetails();
    }

    openChat() {
        const navigationExtras: NavigationExtras = {
           state: {
              opportunityId: this.item.opportunityId,
              custId: this.authData?.authMeta?.customer?.id,
           }
        };
        this.router.navigate(['user', 'chat'], navigationExtras);
    }

    private refreshOrderDetails(showLoader?:boolean) {

        showLoader ? this.getOrderDetails(showLoader) : this.getOrderDetails();
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
        const paymentData= {
            grandTotal: this.item.payment.grandTotal,
            paidAmount: this.item.payment.paidAmount
          }
          const navigationExtras: NavigationExtras = {
            state: {
                itemId: this.itemId,
                paymentDetails: paymentData,
                custId: this.authData?.authMeta?.customer?.id,
            }
          };
          this.router.navigate(['user', 'dashboard', 'payment', this.itemId], navigationExtras);
    }

    async addMedia() {
  
       await this.mediauploadService.selectAndUploadMediaFromGallery( this.constructor.name ,true, null);
        
    }

    handleRefreshFromMedia(event) {
        this.refreshOrderDetails(true);
        
    }

    //phone number validations
    validateContactPhoneNumber(event) {
        const number = event.target.value;

        try {

            let {phoneNumber, isValid} = phone(number, { country: 'USA' })
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
     alphanumericValidation(event){
        if (event && String.fromCharCode(event.charCode).match(/[0-9-( )]/)) {
            return event.charCode
        } else {
            return event.preventDefault();
        }
    }
}
