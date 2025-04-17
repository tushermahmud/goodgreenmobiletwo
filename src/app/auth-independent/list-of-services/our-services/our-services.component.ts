import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule, IonSelect, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AgentService } from 'src/app/core/services/agent/agent.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { OrderService } from 'src/app/core/services/order/order.service';
import { AgentAffiliations } from 'src/app/models/agent-affiliations.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { changeGetStarted, selectAfflilation, selectService } from 'src/app/state/order/order.actions';
import { selectSelectedService } from 'src/app/state/order/order.selectors';

@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrls: ['./our-services.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OurServicesComponent implements OnInit {

  @ViewChild('serviceSelect') serviceSelect: IonSelect;

  services = [];
  selectedServiceId: string;
  getOrderState: Observable<any>;
  userAuthStatus: Observable<any>;
  authData: AuthState;

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `All Services`
  };

  loginUserType = null;
  affiliationsData: AgentAffiliations = null;

  selectedAffiliation = null;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private orderService: OrderService,
    private store: Store<AppState>,
    private loaderService: IonLoaderService,
    private navController: NavController,
    private alertController: AlertController,
    private agentService: AgentService,

  ) {
    this.getOrderState = this.store.select(selectSelectedService);
    this.userAuthStatus = this.store.select(selectAuthData);
    console.log('this.getOrderState',this.getOrderState);
  }

  async ngOnInit(): Promise<void> {
    
    this.userAuthStatus.subscribe( data => {
      this.authData = data;
      if(this.authData && this.authData?.isAuthenticated){
        this.heraderInfo.isUserProfileVisible = true;
        this.loginUserType  = this.authData.authMeta.type;
        console.log('this.authData',this.authData.authMeta.type);
      }

    });

    this.getOrderState.subscribe((service) => {
      console.log('getOrderState ==>>',service);
    });

    if( this.authData && this.authData?.isAuthenticated && this.loginUserType === 'agent') {
      // call service api here 
      // and set the data in the dropdown
      let agentId =  this.authData.authMeta.agent.id;
      this.getAffiliationsList(agentId);
      
    } else {
      
      this.getServices();
    }

  }
  


  getAffiliationsList(agentId: string) {
    this.loaderService.createLoading('Loading affiliations ...')
    this.agentService.getAffiliations(agentId).subscribe({
      next: async (data:AgentAffiliations) => {
        this.affiliationsData = data;
        console.log('this.affiliationsData', this.affiliationsData.affiliations);
        await this.loaderService.dismissLoading();
        this.serviceSelect.open();
        
      },
      error: async (error) => {
        console.log('error',error);
        await this.loaderService.dismissLoading();
      }
    })
  }

  getServices(agentId?: string) {

    console.log(`loading service list...`);
    this.loaderService.createLoading('Loading services...');
    let getServiceObs = this.loginUserType === 'agent' ? this.orderService.getServices(agentId)   : this.orderService.getServices();

    getServiceObs.subscribe({
      next: async (res) => {
        this.services = res;
        console.log('services ==>', this.services);
        await this.loaderService.dismissLoading();
      },
      error: async (err) => {
        console.error(`error loading service list...`, err);
        await this.loaderService.dismissLoading();
        this.onServicesLoadFailure(err);
      }
    });
  }

  selectService(index): void {
    if(this.selectedServiceId !== this.services[index].id) {
      this.selectedServiceId = this.services[index].id;
    } else {
      this.selectedServiceId = null;
    }
  }

  toVideo() {
    // validater check for agent
    if(this.loginUserType === 'agent' && (!this.selectedServiceId || !this.selectedAffiliation) ) {
      return;
    } 

    // validater check for customer
    if(!this.selectedServiceId) {
      return;
    }

    const service = this.services.find(s => s.id === this.selectedServiceId);
    if(this.authData?.isAuthenticated && this.authData.authMeta.type === 'agent') {

      this.store.dispatch(selectAfflilation({
        afflilation: this.selectedAffiliation  // selected guy will go here 
      }));
      
    }

    this.store.dispatch(selectService({
      selectedService: service
    }));
    this.store.dispatch(changeGetStarted({
      getStarted: true
    }));
    // this.router.navigate(['iauth', 'video-upload', 'capture']);
    this.navController.navigateForward(['iauth', 'list-of-services', 'add-activity']);
  }

  async onServicesLoadFailure(err: any) {

    console.log(err);
		let message = `We encountered an issue and couldn't load the list of services. To try again click Retry.`;

		const alert = await this.alertController.create({
		  header: 'Service Error',
		  message,
		  buttons: [{
        text: `Retry`,
        role: 'confirm',
        handler: () => {
            this.getServices();
        }
    }, {
        text: 'Close',
        role: 'cancel',
        handler: () => {
        },
    }],
		});
	
		await alert.present();
	}


  onAffiliationChange(event) {
    console.log('Event', event); 
    let selectedAffiliation = event.detail.value;
    let affIndex = this.affiliationsData.affiliations.findIndex(x => x.id === selectedAffiliation);
    
    if(affIndex !== -1) {
      this.selectedAffiliation = this.affiliationsData.affiliations[affIndex];
      this.getServices(this.selectedAffiliation.slug);
      // set the stoe data
      // this.store.dispatch(selectAfflilation({
      //   afflilation: this.affiliationsData.affiliations[affIndex]
      // }));
      
    }

  }
}
