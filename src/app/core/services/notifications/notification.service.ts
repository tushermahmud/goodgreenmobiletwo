import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Observable } from 'rxjs';
import { AppSettings } from '../../utils/app-settings';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { NotificationMessageHandler } from './notification-message.handler';
import { AuthState } from 'src/app/state/auth/auth.state';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { Device } from '@ionic-native/device/ngx';


@Injectable({
  providedIn: 'root'
})
export class NotificationManagerService {

  private readonly fcmToken = 'fcm-token';
  private readonly apnsToken = 'apns-token';
  private ggNotification = AppSettings.GG_NOTIF_ENDPOINT;
  private permissionsGranted = false;
  private getAuthState: Observable<AuthState>;
  private authState: AuthState;

  constructor(private nativeStorage: NativeStorage,
    private http: HttpClient,
    private firebase: FirebaseX,
    private messageHandler: NotificationMessageHandler,
    private store: Store<AppState>,
    private device: Device
  ) {
    this.getAuthState = this.store.select(selectAuthData);
  }

  get permissionGranted() { return this.permissionsGranted; }


  /*** Register with gg-notifications service the new token received
   * @param payload
   * @returns
   */
  registerToken(payload: any): Observable<any> {
    return this.http.put(this.ggNotification + `tokens/register`, payload);
  };


  /**
   * Check permission to receive push notifications and return hasPermission: true.
   * iOS only (Android will always return true).
   *
   * @returns hasPermission: true | false
   */
  public async hasPermissions() {

    return await this.firebase.hasPermission();
  }

  public async grantPermissions() {

    return await this.firebase.grantPermission();
  }

  /**
   * User logged out, do not show any more notifications
   */
  public async turnOffNotifications() {
    await this.firebase.unregister();
    // return await this.firebase.registerAuthStateChangeListener()
  }

  /**
   * Initializes the push notfications workflow based on the permissions granted by the user.
   *
   * @param isIOS
   * @returns
   */
  public async initialize(isIOS: boolean) {

    // subscribe for authentication state changes
    this.getAuthState.subscribe(async (authState) => {
      this.authState = authState;
      const androidToken = await this.nativeStorage.getItem(this.fcmToken);
      console.log('token from native', androidToken);

      //registering to notification service
      this.registerAndUpdate(this.authState,androidToken);
    });

    this.permissionsGranted = await this.checkPermissions(isIOS);
    console.log('checking permissions result',this.permissionsGranted);
    if (!this.permissionsGranted) {
      console.log(`permissions not granted by the user, will not handle push notifications`);
      return;
    }

    // 1. iOS specific
    if (isIOS) {
      this.iosApnTokenCallback();
    }

    // 2. register the token callback
    this.fcmTokenRefreshCallback();

    // 3. register the handler for new push notifications
    this.messageHandler.newMessages(this.authState);

    // 4. fetch the firebase token and save it
    await this.getFirebaseToken();
  }

  /**
   * Wrapper function to check and prompt user for push notifications permissions.
   * Supports only iOS devices, need to check for Android
   *
   * @param isIOS
   * @returns
   */
  private async checkPermissions(isIOS: boolean) {
    console.log('checking permissions');

    if (!isIOS) {
      return await this.firebase.grantPermission();
    }

    const hasPermission = await this.firebase.hasPermission();
    if (!hasPermission) {
      return await this.firebase.grantPermission();
    }
    return hasPermission;
  }

  /**
   * For iOS devices only, to receive the APN token
   */
  private iosApnTokenCallback() {

    this.firebase.onApnsTokenReceived().subscribe({
      next: (apnsToken) => {
        console.log(`APNS TOKEN RECEIVED: `, JSON.stringify(apnsToken));
        this.nativeStorage.setItem(this.apnsToken, apnsToken);
      },
      error: (err) => {
        console.log('error', err);
      }
    });
  }

  private async getFirebaseToken() {

    console.log('fetching firebase token');
    await this.firebase.getToken().then(async token => {

      console.log(`The token is: ${token}`);
      this.nativeStorage.setItem(this.fcmToken,token);

    }).catch(err => {
      console.log(`error fetching firebase token`, err);
    });
  }


  /**
   * callback method for token refresh from firebase sdk
   */
  private fcmTokenRefreshCallback() {
    // on token refreshed
    this.firebase.onTokenRefresh().subscribe({
      next: async (newToken) => {
        console.log(`TOKEN REFRESHED: `, newToken);
        this.storeTokenAndUpdate(newToken);
      },
      error: (err) => {
        console.log('error', err);
      }
    });
  }

  /**
   * Stores the new firebase token recevied to the the native storage
   * and also calls the remote API to register the token with gg-notifications service
   *
   * @param newToken
   */
  private async storeTokenAndUpdate(newToken: string) {
    const prevToken = await this.nativeStorage.getItem(this.fcmToken);
   if(newToken && newToken !== prevToken) {
      await this.nativeStorage.setItem(this.fcmToken, newToken);

      //updating token in db
      this.registerAndUpdate(this.authState,newToken);
    }
  }


  //common register/update function
  private async registerAndUpdate(auth, fcmToken) {
    if (auth.isAuthenticated) {
      let payload;
      if (auth.authMeta.type === 'customer') {
        payload = {
          token: fcmToken,
          platformAccountId: auth.authMeta.customer.accountId,
          userId: auth.authMeta.userId,
          userType: auth.authMeta.type,
          installId: this.device.uuid,
          platform: this.device.platform,
          os:this.device.version,
          device: this.device.manufacturer + ' ' + this.device.model
        };
      }
      else if (auth.authMeta.type === 'employee') {
        payload = {
          token: fcmToken,
          platformAccountId: auth.authMeta.employee.accountId,
          userId: auth.authMeta.userId,
          userType: auth.authMeta.type,
          userRole: auth.authMeta.employee.role,
          businessAccountId: auth.authMeta.employee.businessAccountId,
          installId: this.device.uuid,
          platform: this.device.platform,
          os: this.device.version,
          device: this.device.manufacturer + ' ' + this.device.model
        };
      }
      console.log('payload',payload);
      this.registerToken(payload).subscribe({
        next: result => {
          console.log('Registration/updation is successful', result);
        },
        error: err => {
          console.log('error', err);
        }
      });
    }
    // else {
    //   await this.firebase.unregister();
    // }
}
}
