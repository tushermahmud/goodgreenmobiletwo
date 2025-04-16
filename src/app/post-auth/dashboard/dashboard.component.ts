import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonAccordionGroup, NavController, Platform, RefresherCustomEvent, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { AccountStatus } from 'src/app/definitions/account-status.enum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { changeGetStarted } from 'src/app/state/order/order.actions';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

    @ViewChild('accordionGroup', { static: true }) accordionGroup: IonAccordionGroup;

    readonly DEFAULT_HEADER = `Your Dashboard`;
    getAuthState: Observable<AuthState>;
    authData: AuthState;
    orders = [];
    serviceItems = [];
    isLoading = false;
    refreshEvent: RefresherCustomEvent = null;
    refreshUi = false;
    isRefreshDashboard:boolean = false;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: false,
        isnotificationIconVisible: true,
        isUserProfileVisible: true,
        headerText: this.DEFAULT_HEADER,
    };
    navigationEndSubscription: Subscription;

    constructor(
        private store: Store<AppState>,
        private navController: NavController,
        private orderService: OrderService,
        private commonService: CommonService,
        private loaderService: IonLoaderService,
        private actRoute: ActivatedRoute,
        private router: Router,
        private platform: Platform,
        private toastController: ToastController
        ) {

        this.actRoute.queryParams.subscribe(routData => {
            if(this.router.getCurrentNavigation()?.extras?.state){
                let state = this.router.getCurrentNavigation()?.extras?.state;
                console.log('State', state);
                state.refresh === true ? this.isRefreshDashboard = true : this.isRefreshDashboard = false;
            }   
        })

        this.getAuthState = this.store.select(selectAuthData);

        
        
    }

    async ngOnInit() {
        
        this.getAuthState.subscribe((authData) => {
            this.authData = authData;
            console.log('authData:', authData);
            this.heraderInfo.headerText = `Hello ${authData.authMeta?.customer?.fullname}`;
            if (!authData.isAuthenticated) {
                this.refreshUi = true;
            }
        });
        
        this.refreshDashboard();
        await this.showActivationToast();
        if(this.authData.authMeta.accountStatus === AccountStatus.PENDING) {
         }
    }

    async ionViewDidEnter() {
        console.log('this.authData.authMeta.accountStatus ', this.authData.authMeta.accountStatus );
        console.log(' AccountStatus.PENDING ',  AccountStatus.PENDING );
        
        if(this.authData.authMeta.accountStatus === AccountStatus.PENDING) {
           await this.showActivationToast();
        }
    }

    ionViewWillEnter() {
        
        if (this.refreshUi || this.isRefreshDashboard) {
            this.refreshUi = false;
            this.refreshDashboard();
        }
    }
 
    getServiceRequests() {

        this.orders = [];
        this.orderService.getServiceRequests(this.authData?.authMeta?.customer?.id).subscribe(
            (res) => {
                this.orders = res;
                this.orders = [...this.orders];

                this.closeRefreshUi();
            },
            (err) => {
                this.closeRefreshUi();
                console.log(err);
                this.loaderService.dismissLoading();
            }
        );
    }

    createNewRequest() {
        this.store.dispatch(changeGetStarted({
            getStarted: true,
        }));

        // this.router.navigate(['']);
        this.navController.navigateForward([
            'iauth',
            'list-of-services',
            'our-services',
        ]);
    }

    getDetails(orderId, item) {
        // this.router.navigate(['user', 'dashboard', 'order-details', orderId, item.id]);
        this.navController.navigateForward([
            'user',
            'dashboard',
            'order-details',
            orderId,
            item.id,
        ]);
    }

    getServiceRequest(index) {

        this.isLoading = true;
        this.orderService.getServiceRequest(
            this.authData?.authMeta?.customer?.id,
            this.orders[index].id
        ).subscribe((res) => {
            this.orders[index].request = res;
            this.commonService.setServiceRequestInfo(res);
            this.isLoading = false;
        });
    }

    // Dashboard refresher
    doRefresh(event) {
        console.log('Begin async operation', event);
        this.refreshEvent = event;
        this.isLoading = true;
        this.getServiceRequests();
        // this.refreshDashboard();
    }

     private async refreshDashboard() {

        if (!this.refreshEvent && !this.isRefreshDashboard) {
           await this.loaderService.createLoading('Please wait, loading your dashboard...');
        }
        this.getServiceRequests();
    }

    private closeRefreshUi() {

        if (this.refreshEvent) {
            this.refreshEvent.target.complete();
            this.isLoading = false;
        }
        else {
            this.loaderService.dismissLoading();
        }
    }


    async showActivationToast() {
        let currentRoute = this.router.url;
        if (this.authData.authMeta.accountStatus === AccountStatus.PENDING) {
            const toast = await this.toastController.create({
                message: 'To verify your account, please validate your email now.',
                duration: 0,
                buttons: [
                {
                    text: 'VALIDATE',
                    handler: () => {
                    this.router.navigate(['user', 'profile', 'verify-email',  this.authData?.authMeta?.customer?.email])
                    }
                }
                ]
            });

            toast.present();
            //   if(currentRoute === '/user/dashboard'){

            //   } else {
            //     toast.dismiss();
            //   }
            const navigationEndSubscription: Subscription = this.router.events .pipe(filter((event) => event instanceof NavigationEnd))
                .subscribe(() => {
                toast.dismiss(); 
                });
            
            this.navigationEndSubscription = navigationEndSubscription;
        
        }
       
    }
  
    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        if (this.navigationEndSubscription) {
            this.navigationEndSubscription.unsubscribe();
        }
    }
}
