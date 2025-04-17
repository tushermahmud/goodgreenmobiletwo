import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { AppState } from 'src/app/state/app.state';
import { updateGetStartedStatus } from 'src/app/state/auth/auth.actions';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { getOrderData } from 'src/app/state/order/order.selectors';
import { selectAllTodos } from 'src/app/state/todos/todo.selectors';
import SwiperCore, { Pagination, Swiper } from 'swiper';
import { SwiperModule } from 'swiper/angular';
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SwiperModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class GetStartedComponent implements OnInit {
  public allTodos$ = this.store.select(selectAllTodos);
  private readonly GET_STARTED = 'Get Started';
  private readonly MY_DASHBOARD = 'My Dashboard';

  getAuthState: Observable<AuthState>;
  getAuthState2: Observable<AuthState>;
  getOrderState: Observable<any>;

  actionButtonLabel = this.GET_STARTED;
  authData: AuthState;
  orderData;

  isActionBtnVisible: boolean  = false;
  getStartedState: boolean;
  swiperEvent: Swiper = null;
  swiperSlides = [
    {
      image: '../../../assets/images/get-started/select-a-service.svg',
      title: 'Select a Service',
      content: 'Choose from a number of services such as moving, packing, organizing, and hauling.'
    },
    {
      image: '../../../assets/images/get-started/input-your-info.svg',
      title: 'Input your Info',
      content: 'Provide us with your information so we can get out there and get the job done!'
    },
    {
      image: '../../../assets/images/get-started/professionals-get-the-job-done.svg',
      title: 'Professionals Get the Job Done!',
      content: 'Our licensed and insured professionals will ensure that the job gets done on time with the highest quality and attention to detail.'
    },
    {
      image: '../../../assets/images/get-started/looking-out-for-the-environment.svg',
      title: 'Looking out for the Environment',
      content: 'Good Green is dedicated to rebuilding habitats around the world'
    }
  ]

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private cd: ChangeDetectorRef,
    private navCtrl: NavController,
    private storageService: StorageService
    ) {
    this.getAuthState = this.store.select(selectAuthData);
    this.getOrderState = this.store.select(getOrderData);
  }

  async ngOnInit() {
    this.getAuthState.subscribe((user) => {
      this.authData = user;
      console.log('this.authData from GetStartedComponent', this.authData);
      
    });
    this.getOrderState.subscribe((order) => {
      this.orderData = order;
      console.log('DETAILS',order, this.authData);
      // checking for the location
      if(this.authData.isAuthenticated) {

        this.actionButtonLabel = this.MY_DASHBOARD;
        if(!this.orderData.getStarted) {
          if(this.authData.authMeta.type === 'employee') {
            this.router.navigate(['lead', 'employee-dashboard']);
          } else if(this.authData.authMeta.type === 'agent') {
            this.router.navigate(['agent', 'agent-dashboard']);
          } else {
            this.router.navigate(['user', 'dashboard']);
          }
        }
      } 

      // if(!this.authData.isAuthenticated && !this.authData.getStartedViewed) {
      //   this.isActionBtnVisible = true;
      // }
      
    });
    console.log('this.authData.getStarted', this.authData.getStartedViewed);
    this.getStartedState  = await this.storageService.getGetStartedState();
    console.log('getStartedState LOCAL STORE', this.getStartedState);
    
    if(this.getStartedState === true) {
      this.isActionBtnVisible = true;
    }
    // this.cd.detectChanges();
    // this.store.dispatch(loadTodos());
    // this.router.navigate(['iauth', 'video-upload', 'capture']);
    // this.authData.getStartedViewed = false
  }

  nextStepNavigate() {

    if(this.authData.isAuthenticated) {
      this.actionButtonLabel = this.MY_DASHBOARD;
      if(!this.orderData.getStarted) {
         //after login this will set this history to emptu , user cant go back after login
         const navigationExtras = { replaceUrl: true };

         if(this.authData.authMeta.type === 'employee') {
           this.navCtrl.navigateRoot(['lead', 'employee-dashboard'], navigationExtras);

         } else if (this.authData.authMeta.type === 'agent') {
           this.navCtrl.navigateRoot(['agent', 'agent-dashboard'], navigationExtras);

         } else if (this.authData.authMeta.type === 'customer') {
           this.navCtrl.navigateRoot(['user', 'dashboard'], navigationExtras);

         }
         // this.registerToNotification();
         
      }
    }
    else {
      this.toLOS();
    }
    // this.router.navigate(['iauth', 'video-upload', 'capture']);
  }

  toLOS() {
    this.actionButtonLabel = this.GET_STARTED;
    this.navCtrl.navigateForward(['iauth', 'list-of-services', 'our-services']);
  }

  onSwiper(swiper) {
    console.log('swiper', swiper);
  }


  async onSlideChange(event) {

    let swiperEvent: Swiper = event[0];
    this.swiperEvent = event[0];
    
    if(swiperEvent.isEnd) {
      
      this.storageService.setGetStartedMeta();

      this.store.dispatch(updateGetStartedStatus({
        getStartedViewed: true
      }));

      this.isActionBtnVisible = true;

    } 
    // else if (!this.getStartedState && !swiperEvent.isEnd) {

    //   this.isActionBtnVisible = false;

    // }

    // if(swiperEvent.isEnd) {
    //   this.isActionBtnVisible = true 
    // } else{
    //   this.isActionBtnVisible = false 
    // }
    this.cd.detectChanges();
  }
}
