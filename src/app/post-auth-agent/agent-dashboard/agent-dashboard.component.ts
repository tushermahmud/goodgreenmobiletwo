import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Route, Router } from '@angular/router';
import { IonAccordionGroup, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AgentService } from 'src/app/core/services/agent/agent.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { ServiceRequestList } from 'src/app/models/agend-dashboard';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { changeGetStarted } from 'src/app/state/order/order.actions';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {

  @ViewChild('accordionGroup', { static: true }) accordionGroup: IonAccordionGroup;

  getAuthState: Observable<AuthState>;
  authData: AuthMeta

  serviceRequests: ServiceRequestList = null;
  servicesObs$:any;
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: false,
    isnotificationIconVisible: false,
    isUserProfileVisible: true,
    headerText: `Dashboard`,
  }; 

  constructor(
    private store: Store<AppState>,
    private navController: NavController,
    private agentService: AgentService,
    private router: Router,
    private loaderService: IonLoaderService,
    // private cd: ChangeDetectorRef
  ) { 
    this.getAuthState = this.store.select(selectAuthData);
   }

  ngOnInit(): void {
    this.getAuthState.subscribe(authData => {
      console.log('AGENT DASHBOARD',authData);
      this.authData = authData.authMeta;
    })
    this.servicesObs$ = this.agentService.getServiceRequests(this.authData.agent.id)
  }
  
  ionViewWillEnter() {
    
    this.getDashboardData(this.authData.agent.id);
  }

  ionViewDidLoad() {
    // Set the dashboard as the new root page
    // this.navController.push('DashboardPage', null, { replaceUrl: true });

  }

  getDashboardData(agentId) {
    this.loaderService.createLoading('Loading service request list..')
    this.agentService.getServiceRequests(agentId).subscribe({
      next: (data: ServiceRequestList) => {
        console.log('AGENT DASHBOARD RES', data);
        this.serviceRequests = data;
        // this.cd.detectChanges();
        this.loaderService.dismissLoading()
      },
      error: (error) => {
        console.log('error',error);
        this.loaderService.dismissLoading()
        
      }
    })
  }

  createNewRequest() {
      console.log('NEW REQUEST');
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

  goToSrDetails(serviceRequestId: number, serviceItem: any) {
    console.log('srId, item', serviceRequestId, serviceItem);
    this.router.navigate(['agent', 'sr-details', serviceRequestId, 'sr-item' , serviceItem.id ])
  } 

  handlePullRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.getDashboardData(this.authData.agent.id);
      event.target.complete();
    }, 2000);
  }
}
