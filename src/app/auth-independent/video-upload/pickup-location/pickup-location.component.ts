import { CommonModule, DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AlertController, IonicModule, ModalController, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DEFAULT_SERVICE_LABEL,
    MOVING_FROM, PICKUP_LOCATION,
    SERVICE_REQ_MAX_STEPS,
    SERVICE_REQ_STEP_1,
    SITE_ADDRESS, SITE_LOCATION } from 'src/app/auth-independent/video-upload/video-upload-constants';
import { ServiceCategory } from 'src/app/definitions/service-category.enum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { addContactDetail,
    addDropAddress,
    addEstimatedDate,
    addEstimatedTime,
    addIntermediateAddress,
    addPickUpAddress,
    addServiceItemNotes } from 'src/app/state/order/order.actions';
import { OrderState } from 'src/app/state/order/order.reducers';
import { getOrderData } from 'src/app/state/order/order.selectors';
import phone from 'phone';
import { AddLocationComponent } from 'src/app/shared/components/add-location/add-location.component';

// eslint-disable-next-line no-var
declare var google;

@Component({
    selector: 'app-pickup-location',
    templateUrl: './pickup-location.component.html',
    styleUrls: ['./pickup-location.component.css'],
    standalone: true,
	imports: [
		CommonModule,
		IonicModule,
        ReactiveFormsModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
    // providers:[DatePipe]
})
export class PickupLocationComponent implements OnInit {

    autocomplete: { input: string };
    autocompleteItems: any[];
    placeid: any;
    googleAutocomplete: any;

    address: any;
    lat: string;
    long: string;

    pickUpForm: FormGroup;
    locationsForm:FormGroup;
    submitted = false;
    submitBtnLoader = false;
    errorCode = null;
    statusCode = null;
    minDate = new Date();//.toJSON().slice(0, 10).replace(/-/g, '-');
    getOrderState: Observable<OrderState>;
    orderData: OrderState;
    getAuthState: Observable<AuthState>;
    authData: AuthState;
    currentPin = 'pickup'; // default for moving
    estDateTime: Date = new Date();
    isNotMovingService:boolean = false;
    isActive:boolean = false;

    // view data model
    serviceLabel = DEFAULT_SERVICE_LABEL;
    locationTitle = PICKUP_LOCATION;
    siteLabel = MOVING_FROM;
    readonly currentStep = SERVICE_REQ_STEP_1;
    totalSteps = SERVICE_REQ_MAX_STEPS - 1;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: false,
        isUserProfileVisible: false,
        headerText: this.serviceLabel
    };
    isPhoneValid:boolean = false;
    selectedAddressFieldIndex = 0;
    locationType:'pick-up' | 'drop-off' | 'new' = 'pick-up';

    constructor(
        private router: Router,
        public zone: NgZone,
        private nativeGeocoder: NativeGeocoder,
        private formBuilder: FormBuilder,
        private store: Store<AppState>,
        private navCtrl: NavController,
        private datePipe: DatePipe,
        private alertController: AlertController,
        private modalController: ModalController
        ) {
        // console.log(google);
        this.googleAutocomplete = new google.maps.places.AutocompleteService();
        this.autocomplete = { input: '' };
        this.autocompleteItems = [];
        this.getOrderState = this.store.select(getOrderData);
        this.getAuthState = this.store.select(selectAuthData);
    }

    get f() { return this.pickUpForm.controls; }

    ngOnInit(): void {

        // form controls
        this.pickUpForm = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required]],
            email: ['', [Validators.required]],
            address: ['', [Validators.required]],
            city: ['', [Validators.required]],
            state: ['', [Validators.required]],
            zipCode: ['', [Validators.required]],
            notes: [''],
            dropOffAddress: ['', [Validators.required]],
            dropOffCity: ['', [Validators.required]],
            dropOffState: ['', [Validators.required]],
            dropOffZipCode: ['', [Validators.required]],
        });

        //location form array
        this.locationsForm = this.formBuilder.group({
            locations: this.formBuilder.array([])
        });

        this.getOrderState.subscribe((order) => {

            console.log('orderdata ====>', order);
            this.orderData = order;

            // update title of the screen
            this.serviceLabel = this.orderData?.service?.label;
            // update the current/total-steps
            if (this.orderData?.service?.category !== ServiceCategory.MOVING_LONG_DISTANCE &&
                this.orderData?.service?.category !== ServiceCategory.MOVING_SHORT_DISTANCE) {
                this.isNotMovingService = true;
                // no drop-off location for such services
                this.totalSteps = SERVICE_REQ_MAX_STEPS - 1;
                this.locationTitle = SITE_LOCATION;
                this.siteLabel = SITE_ADDRESS;
                this.currentPin = 'site';

                this.pickUpForm.removeControl('dropOffAddress');
                this.pickUpForm.removeControl('dropOffCity');
                this.pickUpForm.removeControl('dropOffState');
                this.pickUpForm.removeControl('dropOffZipCode');
            }
        });

        this.getAuthState.subscribe((auth) => {
            this.authData = auth;
            if (this.authData.isAuthenticated) {
                this.heraderInfo.isUserProfileVisible = true;
                /* this.pickUpForm = this.formBuilder.group({
                    firstName: [this.authData.user.customer.firstname, [Validators.required]],
                    lastName: [this.authData.user.customer.lastname, [Validators.required]],
                    address: [this.authData.user.customer.address, [Validators.required]],
                    city: [this.authData.user.customer.city, [Validators.required]],
                    state: [this.authData.user.customer.state, [Validators.required]],
                    zipCode: [this.authData.user.customer.zipcode, [Validators.required]],
                    movingDate: ['', [Validators.required]],
                    movingTime: ['', [Validators.required]],
                }); */
                if (this.orderData?.service?.category === ServiceCategory.MOVING_LONG_DISTANCE ||
                    this.orderData?.service?.category === ServiceCategory.MOVING_SHORT_DISTANCE) {

                    this.pickUpForm = this.formBuilder.group({
                        firstName: [this.authData.authMeta.customer?.firstname, [Validators.required]],
                        lastName: [this.authData.authMeta.customer?.lastname, [Validators.required]],
                        phoneNumber: [this.authData.authMeta.customer?.phoneNumber, [Validators.required]],
                        email: [this.authData.authMeta.customer?.email, [Validators.required]],
                        address: ['', [Validators.required]],
                        city: ['', [Validators.required]],
                        state: ['', [Validators.required]],
                        zipCode: ['', [Validators.required]],
                        notes: [''],
                        dropOffAddress: ['', [Validators.required]],
                        dropOffCity: ['', [Validators.required]],
                        dropOffState: ['', [Validators.required]],
                        dropOffZipCode: ['', [Validators.required]],
                    });
                }
                else{
                    this.pickUpForm = this.formBuilder.group({
                        firstName: [this.authData.authMeta.customer.firstname, [Validators.required]],
                        lastName: [this.authData.authMeta.customer.lastname, [Validators.required]],
                        phoneNumber: [this.authData.authMeta.customer.phoneNumber, [Validators.required]],
                        email: [this.authData.authMeta.customer.email, [Validators.required]],
                        address: ['', [Validators.required]],
                        city: ['', [Validators.required]],
                        state: ['', [Validators.required]],
                        zipCode: ['', [Validators.required]],
                        notes: ['']
                    });
                }
            }
        });

    }


    get location(){
        return this.locationsForm.controls['locations'] as FormArray;
    }


    toDropLocation() {
        this.router.navigate(['iauth', 'video-upload', 'drop-location']);
    }


    getCoordsFromAddress(address,type) {
        const options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 5
        };

        this.nativeGeocoder.forwardGeocode(address, options).then((result: NativeGeocoderResult[]) => {
            console.log(result, this.address);
            this.zone.run(() => {
                this.lat = result[0].latitude;
                this.long = result[0].longitude;
                /** decoding autocomplete data */
                if (type === 'pick-up') {
                    const addressData = {
                        address: this.address?.structured_formatting?.main_text,
                        city: result[0].locality,
                        state: result[0].administrativeArea,
                        zipCode: result[0].postalCode,
                        country: result[0].countryName,
                    };
                    this.pickUpForm.patchValue(addressData);
                }
                else if(type === 'drop-off'){
                    const addressData = {
                        dropOffAddress: this.address?.structured_formatting?.main_text,
                        dropOffCity: result[0].locality,
                        dropOffState: result[0].administrativeArea,
                        dropOffZipCode: result[0].postalCode,
                        country: result[0].countryName,
                    };
                    this.pickUpForm.patchValue(addressData);
                }
                //it will add new location from google auto search
                else if(type === 'new'){
                    const newLocationForm = this.formBuilder.group({
                        address: [this.address?.structured_formatting?.main_text, [Validators.required]],
                        city: [result[0].locality, [Validators.required]],
                        state: [result[0].administrativeArea, [Validators.required]],
                        zipcode: [result[0].postalCode, [Validators.required]],
                        country:[result[0].countryName,[Validators.required]],
                        pin: ['intermediate']
                    })
                    this.location.push(newLocationForm);
                    console.log('intermediate locations',this.location.value);
                    this.modalController.dismiss();
                }
                this.clearAutocomplete();
            });
        })
            .catch((error: any) => console.log(error));
    }

    // getAddressFromCoords(lattitude, longitude) {
    //   console.log('getAddressFromCoords '+lattitude+' '+longitude);
    //   const options: NativeGeocoderOptions = {
    //     useLocale: true,
    //     maxResults: 5
    //   };
    //   this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
    //     .then((result: NativeGeocoderResult[]) => {
    //       this.address = '';
    //       const responseAddress = [];
    //       for (const [key, value] of Object.entries(result[0])) {
    //         if(value.length>0) {
    //           responseAddress.push(value);
    //         }
    //       }
    //       responseAddress.reverse();
    //       for (const value of responseAddress) {
    //         this.address += value+', ';
    //       }
    //       this.address = this.address.slice(0, -2);
    //     })
    //     .catch((error: any) =>{
    //       this.address = 'Address Not Available!';
    //     });
    // }


    updateSearchResults(addrs,type: 'pick-up' | 'drop-off' | 'new') {
        this.autocomplete.input = addrs;
        this.locationType = type;
        console.log('type',this.locationType)
        if (this.autocomplete.input === '') {
            this.autocompleteItems = [];
            this.clearAutocomplete();
            return;
        }
        var searchObj = {
            input: this.autocomplete.input,
            componentRestrictions: {country: 'us'}
        };

        this.googleAutocomplete.getPlacePredictions(searchObj,
            (predictions, status) => {
                this.autocompleteItems = [];
                this.zone.run(() => {
                    predictions.forEach((prediction) => {
                        this.autocompleteItems.push(prediction);
                    });
                });
            });
    }


    selectSearchResult(item, type: 'pick-up' | 'drop-off' | 'new') {
        // console.log(item.getPlace());
        // alert(JSON.stringify(item));
        this.placeid = item.place_id;
        this.address = item;
        this.getCoordsFromAddress(item.description,type);
    }


    clearAutocomplete() {
        this.autocompleteItems = [];
        this.autocomplete.input = '';
    }


    onDateTimeChanged(event) {
        console.log('date time changed:', this.estDateTime, event);
        console.log(event.detail.value);
        this.estDateTime = event.detail.value;
        this.pickUpForm.patchValue({
            estDateTime: [event.detail.value, [Validators.required]]
        });
    }


    onSubmit() {

        this.submitted = true;

        console.log('this.pickUpForm==============>', this.f, this.pickUpForm.value);

        if (!this.pickUpForm.valid) {
            return;
        }

        if(this.location.length !== 0 && !this.location.valid){
            return;
        }

        console.log(this.pickUpForm);
        // pick up address
        this.store.dispatch(addPickUpAddress({
            address: {
                pin: this.currentPin,
                address: this.pickUpForm.value.address,
                city: this.pickUpForm.value.city,
                state: this.pickUpForm.value.state,
                country: this.pickUpForm.value.country,
                zipcode: this.pickUpForm.value.zipCode,
            },
        }));
        // add contact details to store
        if (!this.isNotMovingService) {
            this.store.dispatch(addDropAddress({
                address: {
                    pin: 'drop',
                    address: this.pickUpForm.value.dropOffAddress,
                    city: this.pickUpForm.value.dropOffCity,
                    state: this.pickUpForm.value.dropOffState,
                    country: 'US',
                    zipcode: this.pickUpForm.value.dropOffZipCode,
                }
            }));
        }

        //if new location added then it stores 
        if (this.location?.length > 0)
            this.store.dispatch(addIntermediateAddress({
                intermediateLocation: this.location.value
            }))

        this.store.dispatch(addContactDetail({
            contact: {
                firstname: this.pickUpForm.value.firstName,
                lastname: this.pickUpForm.value.lastName,
                email: this.pickUpForm.value.email,
                phoneNumber: this.pickUpForm.value.phoneNumber,
            }
        }));
        // add notes to service-item to store
        this.store.dispatch(addServiceItemNotes({
            notes: this.pickUpForm.value.notes
        }));
        // add contact details to store
        this.store.dispatch(addEstimatedDate({
            date: this.estDateTime
        }));
        // add contact details to store
        this.store.dispatch(addEstimatedTime({
            time: this.estDateTime
        }));

        // only for moving services drop-off location needs to be requested for
        // if (this.orderData.service.category == ServiceCategory.MOVING_LONG_DISTANCE
        //     || this.orderData.service.category == ServiceCategory.MOVING_SHORT_DISTANCE) {

        //     this.router.navigate(['iauth', 'video-upload', 'drop-location']);
        // }
        // else {
            this.router.navigate(['iauth', 'video-upload', 'review-service-request']);
        // }
    }


    goBack() {
        this.navCtrl.back();
    }

    //numeric validation
    alphanumericValidation(event){
        if (event && String.fromCharCode(event.charCode).match(/[0-9-( )]/)) {
            return event.charCode
        } else {
            return event.preventDefault();
        }
    }

    //phone number validations
    validateContactPhoneNumber(event) {
        const number = event.target.value;
        let {isValid,phoneNumber} = phone(number, { country: 'USA' })
        if (isValid) {
            this.pickUpForm.controls["phoneNumber"].patchValue(phoneNumber)
            this.isPhoneValid = true;
        }
    }

    //zipcode validations
    noDecimal(event) {
        if (event && String.fromCharCode(event.charCode).match(/[0-9]/)) {
            return event.CharCode
        } else {
            return event.preventDefault();
        }
    }

    //open the location popup
    openModal(action: boolean) {
        this.isActive = action;
        console.log('isactive', this.isActive);
    }

    //delete selected location based on index
    async deleteLocation(index: number) {
        let msg = `Are you sure you want to delete this location?`;
        const alert = await this.alertController.create({
            header: msg,
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('Alert canceled');
                    },
                },
                {
                    text: 'Yes',
                    role: 'confirm',
                    handler: () => {
                        console.log('Alert confirmed');
                        this.location.removeAt(index);
                    },
                },
            ],
        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
        console.log(`Dismissed with role: ${role}`);
    }

    //Edit new locatios
    searchAddress(address: any, index: number) {
        this.autocomplete.input = address;
        this.selectedAddressFieldIndex = index;
        this.locationType = 'new';

        if (this.autocomplete.input === '') {
            this.clearAutocomplete();
            return;
        }
        var searchObj = {
            input: this.autocomplete.input,
            componentRestrictions: {country: 'us'}
        };

        this.googleAutocomplete.getPlacePredictions(searchObj,
            (predictions, status) => {
                this.zone.run(() => {
                    predictions.forEach((prediction) => {
                        this.autocompleteItems.push(prediction);
                    });
                });
            });

        console.log('autosearchItems', this.autocompleteItems);
    }

    //update newly added location
    updateNewLocation(item: any, index: number) {
        this.address = null;
        this.placeid = item.place_id;
        this.address = item;

        const options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 5
        };

        this.nativeGeocoder.forwardGeocode(item?.description, options).then((result: NativeGeocoderResult[]) => {
            console.log(result, this.address);
            this.zone.run(() => {
                this.lat = result[0].latitude;
                this.long = result[0].longitude;
                /** decoding autocomplete data */
                const addressData = {
                    address: this.address?.structured_formatting?.main_text,
                    city: result[0].locality,
                    state: result[0].administrativeArea,
                    zipCode: result[0].postalCode,
                    country: result[0].countryName,
                };
                this.location.at(index).patchValue(addressData);
                console.log('patched successfully')
                this.clearAutocomplete();
            });
        })
            .catch((error: any) => console.log(error));
    }

    //open the location modal
    async openLocationModal() {
        const modal = await this.modalController.create({
            component: AddLocationComponent, // Your modal component
        });
        await modal.present();

        const { data, role } = await modal.onWillDismiss();
        console.log('selected location', data, role);
        this.address = data;
        this.getCoordsFromAddress(this.address?.description,'new');
    }
}
