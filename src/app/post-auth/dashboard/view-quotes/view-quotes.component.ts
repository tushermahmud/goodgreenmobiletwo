import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, RefresherCustomEvent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
    selector: 'app-view-quotes',
    templateUrl: './view-quotes.component.html',
    styleUrls: ['./view-quotes.component.css'],
})
export class ViewQuotesComponent implements OnInit {
    itemId;
    getAuthState: Observable<AuthState>;
    authData: AuthState;
    quotes = [];
    refreshEvent: RefresherCustomEvent = null;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: true,
        isUserProfileVisible: true,
        headerText: `Recieved Quotes`,
    };

    constructor(private loaderService: IonLoaderService,
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private router: Router,
        private orderService: OrderService,
        private navController: NavController
    ) {
        this.getAuthState = this.store.select(selectAuthData);
    }


    ngOnInit(): void {

        this.route.paramMap.subscribe((paramMap) => {
            this.itemId = paramMap.get('itemId');
        });

        this.getAuthState.subscribe((user) => {
            this.authData = user;
        });

        this.refreshOrderDetails();
    }

    async getQuotesForService() {
        await this.loaderService.createLoading('Fetching quotes...');
        this.orderService.getServiceItemQuote(this.authData?.authMeta?.customer?.id, this.itemId).subscribe({
            next: (res) => {
                this.quotes = res;
            },
            error: err => {
                console.log(err);
            },
            complete: () => {
                this.closeRefreshUi();
            }
        });
    }

    toQuoteDetail(index) {
        this.router.navigate([
            'user',
            'dashboard',
            'view-vendor-quote',
            this.itemId,
            this.quotes[index].id,
        ]);
    }

    onCancel() {
        this.navController.back();
    }

    goBack() {
        this.onCancel();
    }

    // View quotes refresher
    doRefresh(event) {
        console.log('Begin async operation');
        this.refreshEvent = event;
        this.refreshOrderDetails();
    }

    private refreshOrderDetails() {

        this.getQuotesForService();
    }

    private closeRefreshUi() {

        if (this.refreshEvent) {
            this.refreshEvent.target.complete();
            this.loaderService.dismissLoading();
        }
        else {
            this.loaderService.dismissLoading();
        }
    }
}
