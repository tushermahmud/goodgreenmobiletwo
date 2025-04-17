import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { getOrderData } from 'src/app/state/order/order.actions';
import { OrderState } from 'src/app/state/order/order.reducers';

declare let google;

@Component({
  standalone: true,
  selector: 'app-agent-service-locations',
  templateUrl: './agent-service-locations.component.html',
  styleUrls: ['./agent-service-locations.component.css'],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AgentServiceLocationsComponent implements OnInit {

  @Input() customerId: any;
  @Output() emitRefresh: EventEmitter<boolean> = new EventEmitter(false);

  logisticsInfo = null;

  logisticLocationsForm: FormGroup;
  locations: FormArray;

  editModeLogistics = false;

  getAuthState: Observable<AuthState>;
  getOrderState: Observable<any>;
  authData: AuthState;
  orderData: OrderState;
  serviceRequestInfo = null;

  autocomplete: { input: string };
  autocompleteItems: any[];
  placeid: any;
  googleAutocomplete: any;

  address: any;
  lat: string;
  long: string;
  selectedAddressFieldIndex = 0;


  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private orderService: OrderService,
    private store: Store<AppState>,
    private nativeGeocoder: NativeGeocoder,
    public zone: NgZone,
  ) {
    this.getAuthState = this.store.select(selectAuthData);
    this.getOrderState = this.store.select(getOrderData);
    this.googleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    }

  ngOnInit(): void {
    this.buildLogisticsForm();
    this.commonService.getOrderItemData().subscribe(locationData => {
      console.log('locationData===>>', locationData);
      if(!locationData) return; // experimental-test
      this.logisticsInfo = locationData;
      this.logisticsFormGetter.clear();
      this.logisticsInfo?.serviceLocations?.map((loc: any) => {

        const form = this.fb.group({
          address: loc.address,
          city: loc.city,
          state: loc.state,
          country:loc.country,
          zipcode: loc.zipcode
        });

        this.logisticsFormGetter.push(form);
      });

    });
    this.commonService.getOrderItemData().subscribe(serviceRequest => {
      this.serviceRequestInfo = serviceRequest;
    });
    this.getAuthState.subscribe((auth) => {
      this.authData = auth;
    });
    this.getOrderState.subscribe((order) => {
      this.orderData = order;
    });
    console.log('logisticsFormGetter', this.logisticsFormGetter.controls);

  }

  buildLogisticsForm() {
    this.logisticLocationsForm = this.fb.group({
      locations: this.fb.array([this.buildLocations()])
    });
  }

  //getter
  get logisticsFormGetter(): FormArray {
    return this.logisticLocationsForm.get('locations') as FormArray;
  }

  buildLocations(): FormGroup{
    return this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zipcode: ['', Validators.required,Validators.minLength(5),Validators.maxLength(6)],
    });
  }

  ionViewDidEnter() {

  }

  editLogistics() {
    //when user click on edit icon in logistic card
    this.editModeLogistics = !this.editModeLogistics;
  };

  saveLogisticsInfo() {
    //when user click on save icon in logistic card
    this.editModeLogistics = false;
  };

  saveLocationdata(formValues, index) {
  console.log('titleEle', formValues);
  const control = <FormArray>this.logisticsFormGetter;
  console.log('control', index, control.length);
  const payload = {
    address: formValues.locations[index].address,
    locationPin: this.logisticsInfo?.serviceLocations[index].pin ,
    city: formValues.locations[index].city ,
    state: formValues.locations[index].state,
    country:formValues.locations[index].country,
    zipcode: formValues.locations[index].zipcode
  };
  console.log('SelectedSavePayload ===>>', this.logisticsInfo, this.authData , this.orderData, this.serviceRequestInfo);
  const customerId = this.customerId;
  this.orderService.updateServiceLocation(customerId, this.serviceRequestInfo.id, this.logisticsInfo.id, this.logisticsInfo?.serviceLocations[index].id, payload).subscribe({
    next: (updatedLocationData) => {
      console.log('updatedLocationData', updatedLocationData);
      this.editModeLogistics = false;
      this.emitRefresh.emit(true);
    }
  });
  }
  // location search functions
  searchAddress(a, address, i) {
    this.autocomplete.input = address;
    this.selectedAddressFieldIndex = Number(a.name);

    if (this.autocomplete.input === '') {
      this.clearAutocomplete();
      return;
    }
    var searchObj = {
      input: this.autocomplete.input,
      componentRestrictions: { country: 'us' }
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

    console.log('this.autocompleteItems', this.autocompleteItems);

  }

clearAutocomplete() {
  this.autocompleteItems = [];
  this.autocomplete.input = '';
}

selectSearchResult(item,i) {
  // console.log(item.getPlace());
  // alert(JSON.stringify(item));
  this.placeid = item.place_id;
  this.address = item;
  this.getCoordsFromAddress(item.description, i);
}


getCoordsFromAddress(address, i) {
  const options: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  this.nativeGeocoder.forwardGeocode(address, options).then((result: NativeGeocoderResult[]) => {
    console.log(result, this.address);
    this.zone.run(() => {
      this.lat = result[0].latitude;
      this.long = result[0].longitude;
      console.log('result location ===>>>', result);
      
      /** decoding autocomplete data */
      const addressData = {
        address: this.address?.structured_formatting?.main_text,
        city: result[0].locality,
        state: result[0].administrativeArea,
        country: result[0].countryName,
        zipcode: result[0].postalCode,
      };
      this.logisticsFormGetter.controls[i].patchValue(addressData);
      this.clearAutocomplete();
    });
  })
    .catch((error: any) => console.log(error));
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