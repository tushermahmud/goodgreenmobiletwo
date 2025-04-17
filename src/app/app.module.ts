import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthEffects } from './state/auth/auth.effects';
import { authReducer } from './state/auth/auth.reducers';
import { orderReducer } from './state/order/order.reducers';
import { TodoEffects } from './state/todos/todo.effects';
import { todoReducer } from './state/todos/todo.reducer';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TokenInterceptor } from './core/interceptors/httpInterceptor';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Device } from '@ionic-native/device/ngx';
import { SharedModule } from './shared/shared.module';
import { DatePipe } from '@angular/common';

@NgModule({
    imports: [
        AppComponent,
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        IonicStorageModule.forRoot(),
        StoreModule.forRoot({
            todos: todoReducer,
            auth: authReducer,
            order: orderReducer,
        }),
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: environment.production,
        }),
        EffectsModule.forRoot([TodoEffects, AuthEffects]),
        HttpClientModule,
        // SharedModule
    ],
    providers: [
        StatusBar,
        DatePipe,
        NativeStorage,
        FirebaseX,
        Device,
        {
            provide: RouteReuseStrategy,
            useClass: IonicRouteStrategy
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
    // exports: [SharedModule] // Export SharedModule here
})
export class AppModule { }
