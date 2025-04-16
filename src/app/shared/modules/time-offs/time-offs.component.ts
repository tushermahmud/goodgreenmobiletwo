import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { TimeOffStatus } from 'src/app/definitions/time-off-status.enum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { TimeOffDto } from 'src/app/models/time-offs.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { RequestTimeoffComponent } from '../../components/request-timeoff/request-timeoff.component';

@Component({
  selector: 'app-time-offs',
  templateUrl: './time-offs.component.html',
  styleUrls: ['./time-offs.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TimeOffsComponent implements OnInit {
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Your Time Offs`,
  };
 
  timeOffsPayload = [];
  timeOffStatus: TimeOffStatus;
  getAuthState: Observable<AuthState>;
  authData: AuthState;
  authMeta: AuthMeta;
  accountId: any;
  baId: any;
  requestedTimeOffs = [];

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private modalController: ModalController,
  ) { 
    this.getAuthState = this.store.select(selectAuthData); 
  }

  ngOnInit(): void {
    this.getAuthState.subscribe((authState) => {
      this.authData = authState;
      this.authMeta = authState?.authMeta;
      this.baId = this.authMeta?.employee?.businessAccountId;
      this.accountId = this.authMeta?.employee?.accountId;
      console.log('this.authData ', this.baId, this.accountId);
    });
  }
    
  ionViewWillEnter() {
    this.getRequestedTimeOffs();
  }

  createNewRequest() {
    let obj = {
      baId: this.baId,
      accountId: this.accountId
    }
    // this.router.navigate(['lead', 'employee-notifications', 'time-offs', 'request-timeoff'], { state: { meta: obj } })
    this.presentTimeOffRequestModel()
  }

  async presentTimeOffRequestModel() {
    const modal = await this.modalController.create({
      component: RequestTimeoffComponent,
      componentProps: {
        baId: this.baId,
        accountId: this.accountId,
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log('data, role ', data, role );
    if(data && data.shouldRefresh) {
      this.getRequestedTimeOffs();
    }

  }

  getRequestedTimeOffs() {
    this.loaderService.createLoading('Loading time-offs')
    this.leadHelperService.getTimeOff(this.baId, this.accountId).subscribe({
      next: respone => {
        console.log('time-offs', respone);
        this.requestedTimeOffs = [...respone]
        this.loaderService.dismissLoading();
      },
      error: err => {
        console.log('error', err);
        this.loaderService.dismissLoading();
      }
    });
  }

  refresh() {
    this.getRequestedTimeOffs();
  }

  handleRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.refresh();
      event.target.complete();
    }, 2000);
  };
}
