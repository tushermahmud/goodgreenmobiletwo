import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { OrderService } from 'src/app/core/services/order/order.service';
import { DEFAULT_SERVICE_LABEL, SERVICE_REQ_MAX_STEPS, SERVICE_REQ_STEP_3 } from 'src/app/auth-independent/video-upload/video-upload-constants';
import { ServiceCategory } from 'src/app/definitions/service-category.enum';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { getOrderData } from 'src/app/state/order/order.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { OrderState } from 'src/app/state/order/order.reducers';
import { addEstimatedDate, addEstimatedTime } from 'src/app/state/order/order.actions';

@Component({
    selector: 'app-review-service-request',
    templateUrl: './review-service-request.component.html',
    styleUrls: ['./review-service-request.component.css']
})
export class ReviewServiceRequestComponent implements OnInit {

    getAuthState: Observable<AuthState>;
    getOrderState: Observable<OrderState>;
    authData: AuthState;
    orderData: OrderState;
    estDateTime:any;
    intermediateLocations:any[];

    // view data model
    serviceLabel: string = DEFAULT_SERVICE_LABEL;
    currentStep = SERVICE_REQ_STEP_3;
    totalSteps = SERVICE_REQ_MAX_STEPS;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: false,
        isUserProfileVisible: false,
        headerText: this.serviceLabel
    };

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private orderService: OrderService,
        public navCtrl: NavController,
    ) {
        this.getAuthState = this.store.select(selectAuthData);
        this.getOrderState = this.store.select(getOrderData);
    }

    ngOnInit(): void {
        this.getAuthState.subscribe((user) => {
            this.authData = user;
            if(this.authData.isAuthenticated){
                this.heraderInfo.isUserProfileVisible = true;
            }
        });

        this.getOrderState.subscribe((order) => {
            this.orderData = order;
            console.log('this.orderData', this.orderData);
            this.estDateTime = this.orderData?.estimatedDate
            // update title of the screen
            this.serviceLabel = this.orderData?.service?.label;
            this.intermediateLocations = this.orderData?.intermediateAddress;
            // update the current/total-steps
            if (this.orderData.service.category !== ServiceCategory.MOVING_LONG_DISTANCE &&
                this.orderData.service.category !== ServiceCategory.MOVING_SHORT_DISTANCE) {

                // no drop-off location for such services
                this.currentStep = SERVICE_REQ_STEP_3 - 1;
                this.totalSteps = SERVICE_REQ_MAX_STEPS - 1;
            }
        });
    }

    next() {
        if (!this.authData?.isAuthenticated) {
            this.router.navigate(['register']);
        } else {
            this.router.navigate(['iauth', 'video-upload', 'additional-services']);
        }
    }

    goToPickup() {
        this.router.navigate(['iauth', 'video-upload', 'pickup-location']);
    }

    goToServices() {
        this.router.navigate(['iauth', 'list-of-services', 'our-services']);
    }

    goBack() {
        this.navCtrl.back();
    }


    onDateTimeChanged(event) {
        console.log('date time changed:', this.estDateTime, event);
        console.log(event.detail.value);
        this.estDateTime = event.detail.value;
        
        this.store.dispatch(addEstimatedDate({
            date: this.estDateTime
        }));
        // add contact details to store
        this.store.dispatch(addEstimatedTime({
            time: this.estDateTime
        }));
    }

}
