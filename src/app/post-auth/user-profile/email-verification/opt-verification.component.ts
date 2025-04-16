import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { logInSuccess, updateAgentProfileInfo, updateUserAuthStatus } from 'src/app/state/auth/auth.actions';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { OrderState } from 'src/app/state/order/order.reducers';
import { getOrderData } from 'src/app/state/order/order.selectors';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit {

  otpForm: FormGroup;
  submitted = false;
  submitBtnLoader = false;
  errorCode = null;
  statusCode = null;

  email: string;

  getAuthState: Observable<AuthState>;
  getOrderState: Observable<OrderState>;
  orderData: OrderState;

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Verify OTP`
 };


 userData;

  constructor(
    private store: Store<AppState>,
    private navCtrl: NavController,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private storageService: StorageService,

  ) {
    this.getAuthState = this.store.select(selectAuthData);
    this.getOrderState = this.store.select(getOrderData);
  }

  get f() { return this.otpForm.controls; }

  ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.email = paramMap.get('email');
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.getOrderState.subscribe((order) => {
      this.orderData = order;
      console.log(this.orderData);
    });

    this.getAuthState.subscribe(data => {
      this.userData = data.authMeta.customer;
      console.log('this.userData ', this.userData );
      
    })
    
  }


  /**
 * Redirect the user to the appropriate dashboard based on their auth type.
 */
  redirectUser(): void  {
    this.getAuthState.pipe(
      switchMap((user) => {
        if (user?.isAuthenticated) {
          const type = user.authMeta.type;
          switch (type) {
            case 'customer':
              const route = this.orderData?.getStarted
                ? ['iauth', 'video-upload', 'additional-services']
                : ['user', 'dashboard'];
              return of(route);
            case 'agent':
              return of(['agent', 'agent-dashboard']);
            case 'employee':
              return of(['lead', 'employee-dashboard']);
            default:
              console.error(`Unknown user type: ${type}`);
              return EMPTY;
          }
        } else {
          return EMPTY;
        }
      })
    ).subscribe((route) => this.router.navigate(route));
  }

  onSubmit(){
    this.submitted = true;

    if(!this.otpForm.valid) {
      return;
    }

    const paylaod = {
      email: this.email,
      otp: this.otpForm.value.otp.toString()
    };

    this.authService.otpVerification(paylaod).subscribe((res) => {

      //Update account status in the store store.dispatch(updateUserAuthStatus({ status: true }));
      this.store.dispatch(updateUserAuthStatus());
      this.storageService.updateAccountStatus();
      this.presentToast();
      this.navCtrl.back();

    }, err => {
      console.log(err);
    });
  }

  back() {
    this.navCtrl.navigateBack('');
  }
  async requestNewOtp() {
    const alert = await this.alertController.create({
      header: 'Request new OTP',
      message: `Hey ${this.userData?.firstname}, clicking on "Yes" will send you a new OTP to your registered email.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Yes',
          handler: async () => {
            // Handle sending new OTP, call the otp from sunil 
            this.requestNewOTP();
          }
        }
      ]
    });
  
    await alert.present();
  }

  async requestNewOTP() {
    let payload = {
      email: this.userData.email
    }
    const loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent',
      duration: 8000 // Set a timeout for the loading indicator, in case the request takes too long
    });
    await loading.present();


    console.log('payload', payload);
    
    this.authService.resendOtp(this.userData.id,payload).subscribe({
      next: async (data) => {
        console.log('resendOtp Success', data);
        await loading.dismiss();
        const successAlert = await this.alertController.create({
          message: 'OTP has been sent successfully to your registered email!',
          buttons: ['OK']
        });

        await successAlert.present();
        
        // present toast 
       

      },
      error: async (error: HttpErrorResponse) => {
        console.log('error', error);
        const errorAlert = await this.alertController.create({
          header:'Error',
          message: error.error.errorMessage,
          buttons: ['OK']
        });
        await errorAlert.present();
      }
    })
  }

  // present toast
  async presentToast() {
    const toast = await this.toastController.create({
        message: 'Hooray!! Your account is successfully verified.',
        duration: 2000,
    });
    toast.present();
  }
}
