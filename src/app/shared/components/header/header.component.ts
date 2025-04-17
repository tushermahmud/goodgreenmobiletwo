import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { EmployeeDashboardComponent } from 'src/app/post-auth-lead-mover/employee-dashboard/employee-dashboard.component';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { changeGetStarted } from 'src/app/state/order/order.actions';
import { SharedModule } from '../../shared.module';
import { CommonModule } from '@angular/common';
// import { EmployeeProfileComponent } from '../../modules/employees/employee-profile/employee-profile.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeaderComponent implements OnInit {

  @Input() isBackBtnVisible?: boolean = false;
  @Input() isnotificationIconVisible?: boolean = false;
  @Input() isUserProfileVisible?: boolean = false;
  @Input() headerMeta: any = null;
  @Input() isModel?: boolean = false;

  getAuthState: Observable<AuthState>; 
  authData:any;

  userType: 'employee' | 'customer' | 'agent';
  message: string;

  constructor(
    private navController: NavController,
    public router: Router,
    private authService: AuthService,
    private store: Store<AppState>,
    private modalController: ModalController,
    private commonService: CommonService,

    private storageService: StorageService
  ) {
    this.getAuthState = this.store.select(selectAuthData);
   }

  ngOnInit(): void {
    // console.log('headerMeta', this.headerMeta);
    this.getAuthState.subscribe((authState) => {
      if (!authState) return;
      // console.log('  this.authData, REDIRECT', authState);
      
      this.authData = authState;
      this.userType = this.authData?.authMeta?.type;
      // console.log('this.authData',this.authData, this.userType);
      
    })
  }

  goBack() {
    if(this.router.url.includes('iauth/list-of-services/our-services')) {
      this.store.dispatch(changeGetStarted({
        getStarted: false
      }));
    }

    if(this.router.url.includes('/lead/employee-jobs/job-details')) {
      this.commonService.refreshCurrentJob(true);
      this.storageService.removeJobDetailsMeta();
    }

    if(this.router.url.includes('/lead/employee-jobs/ongoing')){
      this.router.navigate(['lead', 'employee-dashboard']);
    }

 
    if(this.isModel) {
      this.modalController.dismiss();
    } else {
      this.navController.back();
    }
    
  }

  toProfile() {
    
    if(this.userType === 'employee') {
      this.router.navigate(['lead', 'employee-profile']);
    } else if(this.userType === 'agent'){
      this.router.navigate(['agent', 'agent-profile']);
    } else {
      this.router.navigate(['user', 'profile']);
      
    }
  }
 
  signOut() {
    this.authService.signOut();
  }

  employeeSignout() {
    this.signOut()
  }
  
  agentSignout() {
    this.signOut()
  }
  openAffiliations() {
    this.router.navigate(['agent','agent-affiliations']);
  }

}
