import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, NavController, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { logIn } from 'src/app/state/auth/auth.actions';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { OrderState } from 'src/app/state/order/order.reducers';
import { getOrderData } from 'src/app/state/order/order.selectors';
import { Platform } from '@ionic/angular';
import { NotificationManagerService } from 'src/app/core/services/notifications/notification.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  signinForm: FormGroup;
  submitted = false;
  submitBtnLoader = false;
  errorCode = null;
  statusCode = null;
  isIOS = false;
  isAndroid = false;
  deviceInfo: any = {};
  getAuthState: Observable<AuthState>;
  getOrderState: Observable<OrderState>;
  orderData: OrderState;
  loginUserData: any = {};
  token: any;
  appId: any;

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: false,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Log In`
  };
  private readonly fcmToken = 'fcm-token';

  constructor(
    private store: Store<AppState>,
    private navCtrl: NavController,
    private router: Router,
    private formBuilder: FormBuilder,
    public toastController: ToastController,
    private notificationService: NotificationManagerService,
    private platform: Platform,
    private device: Device,
    private nativeStorage: NativeStorage


  ) {
    this.getAuthState = this.store.select(selectAuthData);
    this.getOrderState = this.store.select(getOrderData);

    window.addEventListener('keyboardDidShow', () => {
      document.activeElement.scrollIntoView(true);
    });

    // this.getDeviceDetails();
    // this.initNotifications();
  }

  get f() { return this.signinForm.controls; }

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      header: '',
      message: 'Click to Close',
      icon: 'information-circle',
      position: 'top',
      buttons: [
        {
          side: 'start',
          icon: 'star',
          text: 'Favorite',
          handler: () => {
            console.log('Favorite clicked');
          }
        }, {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();

    const { role } = await toast.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  ngOnInit() {
    this.signinForm = this.formBuilder.group({
        // mike.fowler@mailinator.com 123456
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.getOrderState.subscribe((order) => {
        this.orderData = order;
        console.log('orderData',this.orderData);
    });

    this.getAuthState.subscribe((auth) => {

      if (auth?.isAuthenticated) {
          // this.loginUserData = auth;
          if (this.orderData?.getStarted) {
            this.router.navigate(['iauth', 'video-upload', 'additional-services']);
          } 
          else {

            //after login this will set this history to emptu , user cant go back after login
            const navigationExtras = { replaceUrl: true };

            if(auth.authMeta.type === 'employee') {
              this.navCtrl.navigateRoot(['lead', 'employee-dashboard'], navigationExtras);

            } else if (auth.authMeta.type === 'agent') {
              this.navCtrl.navigateRoot(['agent', 'agent-dashboard'], navigationExtras);

            } else if (auth.authMeta.type === 'customer') {
              this.navCtrl.navigateRoot(['user', 'dashboard'], navigationExtras);

            }
            // this.registerToNotification();
            

          }
      }
      // if login fails throw error
      if (!auth.isAuthenticated && auth.status === 'error' && this.submitted) {
          this.presentToast('Login Failed. Please check your credentials and try again!', 3000);
      }

    });
  }

  async presentToast(msg, time) {
    const toast = await this.toastController.create({
      message: msg,
      duration: time,
      color: 'danger'
    });
    toast.present();
  }

  onSubmit() {
    this.submitted = true;

    // console.log(this.signinForm);
    if (!this.signinForm.valid) {
      return;
    }
    this.store.dispatch(logIn({
      payload: {
        email: this.signinForm.value.email,
        password: this.signinForm.value.password
      }
    }));
  }

  onReset() {
    this.submitted = false;
    this.signinForm.reset();
  }

  forgotPassword() {
    // alert('hi');
    this.router.navigate(['forgot-password']);
  }

  back() {
    this.navCtrl.navigateBack('');
  }

}
