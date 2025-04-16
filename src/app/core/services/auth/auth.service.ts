/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';
import { AppSettings } from '../../utils/app-settings';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StorageService } from '../storage/storage-service.service';
import { AppState } from 'src/app/state/app.state';
import { signOut } from 'src/app/state/auth/auth.actions';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { Location } from '@angular/common';

interface RequestOtp {
    email: string;
}
interface RequestResetPayload {
    email: string;
    otp: string;
    newPassword: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    
    private GG_CORE = AppSettings.GG_CORE_ENDPOINT;
    private GG_IDM = AppSettings.GG_IDM_ENDPOINT;
    private GG_INTG = environment.ggIntegrationsChat;


    auhData = null;
    getAuthState: Observable<any>;

    constructor(
        private http: HttpClient,
        private storage: Storage,
        private router: Router,
        private store: Store<AppState>,
        private storageService: StorageService,
        private navController: NavController,
        private location: Location
    ) { 
        this.getAuthState = this.store.select(selectAuthData);

        this.getAuthState.subscribe(data => {
            console.log('AUTH DATA', data);
            this.auhData = data.authMeta;
        })
    }

    getToken(): string {
        return localStorage.getItem('token');
    }

    logIn(email: string, paswrd: string): Observable<any> {
        const url = `${this.GG_IDM}auth/login/local`;
        return this.http.post<AuthMeta>(url, { username: email, password: paswrd }, {headers: {skip: 'true'}}); // sample to be changed later
    }

    async signOut() {
        await this.storageService.deleteAuthData();
        this.location.replaceState('/login');
        this.store.dispatch(signOut());
        this.navController.navigateRoot(['login']); // this.router.navigate(['login']);
    }

    signUp(payload: any): Observable<any> {
        return this.http.post(this.GG_CORE + 'customers', payload, {headers: {skip: 'true'}});
    }

    otpVerification(payload: any): Observable<any> {
        return this.http.post(this.GG_CORE + 'customers/verify-otp', payload, {headers: {skip: 'true'}});
    }

    updateProfileInfo(customerId, payload): Observable<any> {
        return this.http.put(this.GG_CORE + `customers/${customerId}`, payload);
    }

    getChatAuthToken(payload): Observable<any> {
        return this.http.post(this.GG_INTG + 'twilio/chat', payload);
    }


    /**
   * Sends a request to resend the OTP for the given customer ID
   * @param customerId The ID of the customer to resend the OTP for
   * @returns An Observable of any type, representing the response from the backend API
   */
    resendOtp(customerId: string, payload : {email: string}): Observable<any> {
        return this.http.post(`${this.GG_CORE}customers/${customerId}/resend-otp`, payload);
    }
    
    /**
     * Generates a s3 location based on the file name 
     *
     * @param userType login user type
     * @param userId user id
     */
    addUserProfileImage(userType: string, userId:string, payload): Observable<any> {
        return this.http.post<any>(this.GG_INTG + `fs/${userType}/${userId}/profile-image`, payload )
    }

    /**
     * Upload image to s3
     * @param {string} url
     * @param {File} fileData
    */
    uploadS3Image(url: string, fileData: any): Observable<any> {
        return this.http.put<any>(url, fileData, {headers: {skip: 'true'}});
    }


      /**
   * Informs the backend when a file is uploaded to S3 bucket
   * @param {string} url
   * @param {File} fileData
   */

    saveProfileImage(customerId, payload): Observable<any>{
        return this.http.put(`${this.GG_CORE}customers/${customerId}/profile-image` , payload)
    }

    deleteProfileImage(userId): Observable<any>{
        return this.http.delete(`${this.GG_CORE}users/${userId}/profile-image`)

    }

    /**
     * Delets user account and redirects him to getting started page 
     * @param customerId
     * @returns 
     */
	deleteAccount(customerId): Observable<any> {
		return this.http.delete(this.GG_CORE + `customers/${customerId}`)
	}


    forgotPassword(payload:RequestOtp): Observable<any>  {
        // {{host}}/core/auth/forgot-password
        return this.http.post(this.GG_IDM + `auth/forgot-password`, payload );
    }

    resetPassword(payload: RequestResetPayload): Observable<any> {
        return this.http.post(this.GG_IDM + `auth/reset-password-otp`, payload );
    }

    isAuthenticated(): boolean {
        // Get the authentication token from local storage or any other storage mechanism
        const authToken = this.auhData?.accessToken;
    
        // If the authentication token is present, the user is authenticated
        return !!authToken;
      }
 
}
