import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MustMatch } from 'src/app/core/helpers/must-match.validator';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { logInSuccess } from 'src/app/state/auth/auth.actions';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { OrderState } from 'src/app/state/order/order.reducers';
import { getOrderData } from 'src/app/state/order/order.selectors';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

    signupForm: FormGroup;
    submitted = false;

    isFormValid: boolean = false;

    submitBtnLoader = false;
    errorCode = null;
    statusCode = null;
    getOrderState: Observable<OrderState>;
    orderData: OrderState;
    getAuthState: Observable<AuthState>;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: false,
        isUserProfileVisible: false,
        headerText: `Sign Up`
    };

    constructor(private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private store: Store<AppState>,
        private loaderService: IonLoaderService,
        private alertController: AlertController,
        private cd: ChangeDetectorRef) { 

        this.getAuthState = this.store.select(selectAuthData);
    }

    get f() { return this.signupForm.controls; }

    ngOnInit() {
        this.getOrderState = this.store.select(getOrderData);

        this.signupForm = this.formBuilder.group({
            firstname: ['', [Validators.required]],
            lastname: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        // pre-populate the form fields with the contact details
        this.getOrderState.subscribe((order) => {
            this.orderData = order;
            console.log(this.orderData);

            // this.signupForm.value.firstname = this.orderData.contact.firstname;
            // this.signupForm.value.lastname = this.orderData.contact.lastname;
            // this.signupForm.value.email = this.orderData.contact.email;
            this.signupForm.patchValue({
                firstname: this.orderData.contact.firstname,
                lastname: this.orderData.contact.lastname,
                email: this.orderData.contact.email
            });
        });
        this.listenFormChange();

        this.authStateHandler();
    }

    authStateHandler() {
        this.getAuthState.subscribe((user) => {
            if (user?.isAuthenticated) {
                if (user.authMeta.type === 'customer') {

                    if (this.orderData?.getStarted) {
                        this.router.navigate(['iauth', 'video-upload', 'additional-services']);
                    } else {
                        this.router.navigate(['user', 'dashboard']);
                    }
                } else if (user.authMeta.type === 'agent') {
                    this.router.navigate(['agent', 'agent-dashboard']);
                } else if (user.authMeta.type === 'employee') {
                    this.router.navigate([['lead', 'employee-dashboard']]);
                }
            }
        });
    }

    listenFormChange() {
        this.signupForm.valueChanges.subscribe(change => {
            console.log('change', change);
            if (this.signupForm.valid) {
                this.isFormValid = true
                this.cd.detectChanges();
            } else {
                this.isFormValid = false;
                this.cd.detectChanges();
            }
        })
    }


    async onSubmit() {
        let paylaod;
        this.submitted = true;
        console.log(this.signupForm);
        if (!this.signupForm.valid && this.submitted) {
            return;
        }
        // return;
        await this.loaderService.createLoading('Please wait while we create your account...');

        if (this.orderData?.service?.category !== 'moving_long_distance' &&
            this.orderData?.service?.category !== 'moving_short_distance') {
            paylaod = {
                firstname: this.signupForm.value.firstname,
                lastname: this.signupForm.value.lastname,
                address: this.orderData.pickupAddress.address,
                city: this.orderData.pickupAddress.city,
                state: this.orderData.pickupAddress.state,
                country: this.orderData.pickupAddress.country,
                zipcode: this.orderData.pickupAddress.zipcode,
                email: this.signupForm.value.email,
                password: this.signupForm.value.password,
                phonenumber: this.orderData.contact.phoneNumber
            };
        }
        else {
            paylaod = {
                firstname: this.signupForm.value.firstname,
                lastname: this.signupForm.value.lastname,
                address: this.orderData.dropAddress.address,
                city: this.orderData.dropAddress.city,
                state: this.orderData.dropAddress.state,
                country: this.orderData.dropAddress.country,
                zipcode: this.orderData.dropAddress.zipcode,
                email: this.signupForm.value.email,
                password: this.signupForm.value.password,
                phonenumber: this.orderData.contact.phoneNumber
            };
        }
        /* this.authService.signUp(paylaod).subscribe((res) => {
            // this.router.navigateByUrl('login');
            this.router.navigate(['register', 'otp', this.signupForm.value.email]);
        }, err => {
            console.log(err);
        }); */

        this.authService.signUp(paylaod).subscribe({
            next: async (res) => {
                await this.loaderService.dismissLoading();
                /* this.router.navigate(['register', 'otp', this.signupForm.value.email]); */
                await this.showAccountCreatedAlert(res);
            },
            error: async (err) => {
                console.log('error while creating account', err);
                await this.loaderService.dismissLoading();
                this.onAccountCreateFailure(err);
            }
        });
    }

    toAdServices() {
        this.router.navigate(['iauth', 'video-upload', 'additional-services']);
    }

    toLogin() {
        this.router.navigate(['login']);
    }

    async onAccountCreateFailure(err: any) {

        let message = `Oops! We encountered an issue. Can you also verify the email-id entered is valid and try again.`;
        if (err?.error?.errorCode === 11011) { // The incoming email cannot be used as it is alread registered.
            message = `The incoming email cannot be used as it is already registered.
            To create a new account, try using a different email id or use Log In option with current email.`;
        }

        const alert = await this.alertController.create({
            header: 'Account Failure',
            message,
            buttons: ['OK'],
        });
        await alert.present();
    }

    async showAccountCreatedAlert(loginResponse: any) {

        const message = 'However, your email address still needs to be validated which can be done later as well. To complete the email verification process, ' +
            'navigate to the "Profile" section by clicking the user logo on the top right corner of Dashboard screen. From there, click on the "Verify Email" button to confirm your email address.';

        const alert = await this.alertController.create({
            header: 'Account Success',
            subHeader: 'Thank you for creating an account with Good Green',
            message,
            buttons: [
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        /* this.store.dispatch(logInSuccess({
                            user: loginResponse
                        })); */
                    },
                },
            ],
        });

        await alert.present();

        const { role } = await alert.onDidDismiss();

        console.log('role', role);
        this.store.dispatch(logInSuccess({
            user: loginResponse
        }));
    }


}
