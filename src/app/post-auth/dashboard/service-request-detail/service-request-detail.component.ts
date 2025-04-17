import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { OrderService } from 'src/app/core/services/order/order.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
  selector: 'app-service-request-detail',
  templateUrl: './service-request-detail.component.html',
  styleUrls: ['./service-request-detail.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ServiceRequestDetailComponent implements OnInit {

  requestId;
  getAuthState: Observable<AuthState>;
  authData: AuthState;
  request;

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: true,
    isUserProfileVisible: true,
    headerText: `Service Request`
 };

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {
    this.getAuthState = this.store.select(selectAuthData);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.requestId = paramMap.get('requestId');
    });
    console.log('authData==>>', this.authData);

    this.getAuthState.subscribe((user) => {
      this.authData = user;
    });
    this.getServiceRequest();
  }

  getServiceRequest() {
    this.orderService.getServiceRequest(this.authData?.authMeta?.customer?.id, this.requestId).subscribe(res => {
      this.request = res;
    }, err => {
      console.log(err);
    });
  }

  getDetails(index) {
    this.router.navigate(['user', 'dashboard', 'order-details', this.requestId, this.request.serviceItems[index].id]);
  }

}
