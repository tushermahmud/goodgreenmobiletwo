import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NotificationManagerService } from './core/services/notifications/notification.service';
import { AppState } from './state/app.state';
import { getAuthData } from './state/auth/auth.actions';
import { selectAuthData } from './state/auth/auth.selectors';
import { AuthState } from './state/auth/auth.state';
import { Router } from '@angular/router';


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

    getAuthState: Observable<AuthState>;
    isTokenExpired: boolean = false;

    constructor(
        private store: Store<AppState>,
        private platform: Platform,
        private statusBar: StatusBar,
        private notificationsManager: NotificationManagerService,
        private router:Router
    ) {
        this.getAuthState = this.store.select(selectAuthData);
    }

    ngOnInit() {

        this.statusBar.backgroundColorByHexString('#ffffff');
        this.getAuthState.subscribe((authState) => {
            // console.log(user);
            if (authState?.isAuthenticated) {
                this.isTokenExpired = this.tokenExpired(String(authState?.authMeta?.accessToken))
                console.log('isExpired',this.isTokenExpired);
                if(this.isTokenExpired){
                    this.router.navigate(['login']);
                }
            }
        });

        this.store.dispatch(getAuthData());
        
        this.initializeApp();
    }

    initializeApp() {

        console.log(`initializeApp ====>`);

        this.platform.ready().then(async () => {

            console.log(`post initializeApp ====>`);
            const isIos = this.platform.is('ios') || this.platform.is('iphone') || this.platform.is('ipad');
            const isAndroid = this.platform.is('android') || this.platform.is('cordova') || this.platform.is('desktop') || this.platform.is('mobile') || this.platform.is('mobileweb');

            if (isIos) {
                // no status bar overlay webview in ios
                //this.statusBar.overlaysWebView(false);
                console.log(`post ios statusbar ====>`);

                // setTimeout(() => {

                //     console.log(`after timeout of 3s, showing status bar ====>`);
                //     this.statusBar.overlaysWebView(false);
                //     this.statusBar.backgroundColorByHexString('#0c9447');
                // }, 3000 /** after splash screen is closed */);
            }
            else {
                // let status bar overlay webview in android
                //this.statusBar.overlaysWebView(false);
                console.log(`post android statusbar ====>`);
            }
        
            this.statusBar.overlaysWebView(false);
            this.statusBar.backgroundColorByHexString('#0c9447');

            if(isIos){
              console.log('notification initiated to ios');
              await this.initializeNotification(isIos);
            }
            else{
              console.log('notification initiated');
              await this.initializeNotification(isAndroid);
            }
            // setTimeout(() => {

            //     console.log(`after timeout of 3s, showing status bar ====>`);
            //     this.statusBar.overlaysWebView(false);
            //     this.statusBar.backgroundColorByHexString('#0c9447');
            // }, 3000 /** after splash screen is closed */);

        });
    }

    async initializeNotification(isIos: boolean) {
        await this.notificationsManager.initialize(isIos);
    }

    private tokenExpired(token: string) {
        const expiry = (JSON.parse(atob(token?.split('.')[1]))).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }
}
