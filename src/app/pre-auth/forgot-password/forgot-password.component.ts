import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { MustMatch } from 'src/app/core/helpers/must-match.validator';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

	// config: SwiperOptions = {
	//   slidesPerView: 3,
	//   spaceBetween: 50,
	//   navigation: true,
	//   pagination: { clickable: true },
	//   scrollbar: { draggable: true },
	// };

	isOtpValidated: boolean = false;
	showOtpField: boolean = false;
	vetifyOtp: boolean = false;
	submitted:boolean = false
	isCustomer: boolean = false;
	isAgent: boolean = false;
	isEmployee: boolean = false;

	forgotPasswordForm: FormGroup;
	mode: 'customer' | 'agent' | 'employee';

	heraderInfo: GlobalHeaderObject = {
		isBackBtnVisible: true,
		isnotificationIconVisible: false,
		isUserProfileVisible: false,
		headerText: `Reset Password`
	};

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private loadingCtrl: IonLoaderService,
		private alertController: AlertController,
		private router: Router
	) { }

	ngOnInit() {
		this.buildForgotPasswordForm();
		
	}

	buildForgotPasswordForm() {
		this.forgotPasswordForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			otp: ['', [Validators.required, Validators.pattern(/\-?\d*\.?\d{1,2}/), Validators.minLength(6)]],
			newpassword: ['',[Validators.required, Validators.minLength(6)]],
			confirmnewpassword: ['', [Validators.required, Validators.minLength(6)]]
		},
		{
			validator: MustMatch('newpassword', 'confirmnewpassword')
		})
		
	}

	get f() {
		return this.forgotPasswordForm.controls;
	}

	async onNextClicked() {
		if(this.forgotPasswordForm.controls && this.forgotPasswordForm.controls['email'].valid) {
			await this.loadingCtrl.createLoading('Sending OTP to registerd email address..');
			// call api and send otp and then mark true 
			let payload = {
				email: this.forgotPasswordForm.controls['email'].value,
			}
			this.authService.forgotPassword(payload).subscribe({
				next: (otpSentStatus) => {
					this.showOtpField = true;
					this.vetifyOtp = true;
					console.log('otpSentStatus', otpSentStatus);
					this.loadingCtrl.dismissLoading();
					this.presentOtpSendAlert();
					// this.alertMessage(payload?.email);
				}, 
				error: (err) => {
					console.log(err);
					this.loadingCtrl.dismissLoading();
					this.presentEmailCheckAlert(err);
				}
			})
		}
		// validate email field
	}


	async onSubmit(formvalue) {
		console.log('formvalue', formvalue);
		this.submitted = true
		if(this.forgotPasswordForm.valid) {
			await this.loadingCtrl.createLoading('Requesting for a password change...');
			const payload = {
				email: formvalue.email,
				otp: formvalue.otp,
				newPassword: formvalue.newpassword
			}
			this.authService.resetPassword(payload).subscribe({
				next: (psdUpdateRes)=> {
					console.log('psdUpdateRes', psdUpdateRes);
					this.loadingCtrl.dismissLoading();
					setTimeout(() => {
						this.presentPassResetAlert();
						this.submitted = false
					}, 500);

				}, 
				error: (err) => {
					console.log(err);
					this.submitted = false
					this.loadingCtrl.dismissLoading();
				}
			})
		}
	}

	async presentPassResetAlert() {

		const alert = await this.alertController.create({
		  header: 'Success!',
		  message: 'Your password has beed updated successfully, please continue to login!',
		  buttons: ['OK'],
		});
	
		await alert.present();

		await alert.onDidDismiss().then(() => {

			this.router.navigate(['login']);
		});
		
	}

	async presentEmailCheckAlert(err: any) {

		const message = `The email you entered is not found or maybe the associated account is deleted. 
		Please verify the email-id entered is valid and try again.`;
		// if (err?.error?.errorCode === 11020) { // user does not exist error
		// 	message = err?.error?.errorMessage;
		// }

		const alert = await this.alertController.create({
		  header: 'Unable To Proceed',
		  message,
		  buttons: ['OK'],
		});
	
		await alert.present();
	}

	async presentOtpSendAlert() {

		const message = `An OTP (one time password) is sent to the email. 
		Enter the OTP in this screen and proceed to reset your password.`;

		const alert = await this.alertController.create({
		  header: 'OTP Sent',
		  message,
		  buttons: ['OK'],
		});
	
		await alert.present();
	}

	goToLogin() {
		this.router.navigate(['login']);
	}


	async alertMessage(email) {
		let alert = await this.alertController.create({
			header: 'Success!',
			message: `We've sent an email to ${email}, click the link in the email to reset your password`,
			buttons: [
				{
					text: 'Ok',
					handler: () => {
						this.router.navigate(['login']);
					}
				}
			]
		})

		await alert.present();
	}


	userType(event) {
		console.log('event mode', event)
		if (event?.detail?.value === 'customer') {
			this.isCustomer = true;
			this.isAgent = false;
			this.isEmployee = false;
			this.forgotPasswordForm.reset();
		}
		else if (event?.detail?.value === 'agent') {
			this.isAgent = true;
			this.isCustomer = false;
			this.isEmployee = false;
			this.forgotPasswordForm.reset();
		}
		else {
			this.isEmployee = true;
			this.isCustomer = false;
			this.isAgent = false;
			this.forgotPasswordForm.reset();
		}
	}


	async Submit() {
		if (this.forgotPasswordForm.controls && this.forgotPasswordForm.controls['email'].valid) {
			await this.loadingCtrl.createLoading('Sending reset link to registerd email address..');
			// call api and send otp and then mark true 
			let payload = {
				email: this.forgotPasswordForm.controls['email'].value,
			}
			this.authService.forgotPassword(payload).subscribe({
				next: (otpSentStatus) => {
					console.log('otpSentStatus', otpSentStatus);
					this.loadingCtrl.dismissLoading();
					this.alertMessage(payload?.email);
				},
				error: (err) => {
					console.log(err);
					this.loadingCtrl.dismissLoading();
					this.presentEmailCheckAlert(err);
				}
			})
		}
	}

}
