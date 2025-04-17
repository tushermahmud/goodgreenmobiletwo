import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { IonicModule, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DEFAULT_SERVICE_LABEL, SERVICE_REQ_MAX_STEPS, SERVICE_REQ_STEP_2 } from 'src/app/auth-independent/video-upload/video-upload-constants';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { addDropAddress } from 'src/app/state/order/order.actions';
import { getOrderData } from 'src/app/state/order/order.selectors';


// eslint-disable-next-line no-var
declare var google;
@Component({
    selector: 'app-drop-location',
    templateUrl: './drop-location.component.html',
    styleUrls: ['./drop-location.component.css'],
    standalone: true,
	imports: [
		CommonModule,
		IonicModule,
        ReactiveFormsModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DropLocationComponent implements OnInit {

    autocomplete: { input: string };
    autocompleteItems: any[];
    placeid: any;
    googleAutocomplete: any;

    address: any;
    lat: string;
    long: string;

    dropForm: FormGroup;
    submitted = false;
    submitBtnLoader = false;
    errorCode = null;
    statusCode = null;

    getOrderState: Observable<any>;
    orderData;

    userAuthStatus: Observable<any>;
    authData;

    // view data model
    serviceLabel: string = DEFAULT_SERVICE_LABEL;
    readonly currentStep = SERVICE_REQ_STEP_2;
    readonly totalSteps = SERVICE_REQ_MAX_STEPS;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: false,
        isUserProfileVisible: false,
        headerText: this.serviceLabel
    };

    constructor(
        private router: Router,
        public zone: NgZone,
        private nativeGeocoder: NativeGeocoder,
        private formBuilder: FormBuilder,
        private store: Store<AppState>,
        private navCtrl: NavController
    ) {
        this.googleAutocomplete = new google.maps.places.AutocompleteService();
        this.autocomplete = { input: '' };
        this.autocompleteItems = [];
        this.getOrderState = this.store.select(getOrderData);
        this.userAuthStatus = this.store.select(selectAuthData);


        // const directionsService = new google.maps.DirectionsService();
        // directionsService
        // .route({
        //   origin: {
        //     query: 'Lal Bahadur Sarani, Rabindra Nagar, Behala, Kolkata, West Bengal, India',
        //   },
        //   destination: {
        //     query: 'Kalighat Metro Station, Rash Behari Avenue, Lake Market, Kalighat, Kolkata, West Bengal, India',
        //   },
        //   travelMode: google.maps.TravelMode.DRIVING,
        // })
        // .then((response) => {
        //   console.log(response);
        // })
        // .catch((e) => console.log('Directions request failed due to ' + status));
    }

    get f() { return this.dropForm.controls; }

    ngOnInit(): void {
        this.dropForm = this.formBuilder.group({
            address: ['', [Validators.required]],
            city: ['', [Validators.required]],
            state: ['', [Validators.required]],
            zipCode: ['', [Validators.required]],
            // phone: ['', [Validators.required]],
            //notes: ['', [Validators.required]],
        });

        this.getOrderState.subscribe((order) => {

            console.log('orderdata ====>', order);
            this.orderData = order;

            // update title of the screen
            this.serviceLabel = this.orderData?.service?.label;
        });

        this.userAuthStatus.subscribe((data) => {
            this.authData = data;
            if(this.authData.isAuthenticated){
              this.heraderInfo.isUserProfileVisible = true;
            }
            console.log('this.authData',this.authData);
        });
    }

    toDropLocation() {
        this.router.navigate(['iauth', 'video-upload', 'drop-location']);
    }

    getCoordsFromAddress(address) {
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
                const addressData = {
                    address: this.address?.structured_formatting?.main_text,
                    city: result[0].locality,
                    state: result[0].administrativeArea,
                    zipCode: result[0].postalCode,
                };
                this.dropForm.patchValue(addressData);
                this.clearAutocomplete();
            });
        })
            .catch((error: any) => console.log(error));
    }


    updateSearchResults(addrs) {
        this.autocomplete.input = addrs;
        if (this.autocomplete.input === '') {
            this.autocompleteItems = [];
            return;
        }
        this.googleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
            (predictions, status) => {
                this.autocompleteItems = [];
                this.zone.run(() => {
                    predictions.forEach((prediction) => {
                        this.autocompleteItems.push(prediction);
                    });
                });
            });
    }

    selectSearchResult(item) {
        // console.log(item.getPlace());
        // alert(JSON.stringify(item));
        this.placeid = item.place_id;
        this.address = item;
        this.getCoordsFromAddress(item.description);
    }

    clearAutocomplete() {
        this.autocompleteItems = [];
        this.autocomplete.input = '';
    }

    onSubmit() {
        this.submitted = true;

        console.log(this.dropForm);

        if (!this.dropForm.valid) {
            return;
        }

        this.store.dispatch(addDropAddress({
            address: {
                pin: 'drop',
                address: this.dropForm.value.address,
                city: this.dropForm.value.city,
                state: this.dropForm.value.state,
                country: 'US',
                zipcode: this.dropForm.value.zipCode,
                //notes: this.dropForm.value.notes
            }
        }));

        this.router.navigate(['iauth', 'video-upload', 'review-service-request']);
    }

    toReviewSR() {
        this.router.navigate(['iauth', 'video-upload', 'review-service-request']);
    }

    goBack() {
        this.navCtrl.back();
    }

     //zipcode validations
     noDecimal(event) {
        if (event && String.fromCharCode(event.charCode).match(/[0-9]/)) {
            return event.CharCode
        } else {
            return event.preventDefault();
        }
    }
}
