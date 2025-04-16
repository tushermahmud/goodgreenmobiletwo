/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { getAuthData, logIn, logInError, logInSuccess, updateProfileInfo } from './auth.actions';
import { selectUser } from './auth.selectors';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { TokenResponse } from 'src/app/models/chat.model';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private store: Store<AppState>,
        private authService: AuthService,
        private storageService: StorageService,
    ) { }

    // Run this code when a login action is dispatched
    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logIn),
            map((action) => action.payload),
            switchMap((payload) =>
                // Call the logIn method, convert it to an observable
                from(this.authService.logIn(payload.email, payload.password)).pipe(
                    // Take the returned value and return a new success action containing the user
                    map((user) => logInSuccess({ user })),
                    // Or... if it errors return a new failure action containing the error
                    catchError((error) => of(logInError({ error })))
                )
            )
        )
    );

    // run after login api returns success
    loginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(logInSuccess),
                withLatestFrom(this.store.select(selectUser)),
                // switchMap(([action, user]) => from(this.authService.saveAuthData(user)))
                tap((meta) => {
                    console.log('getChatAuthToken',meta[0].user);
                    if(meta[0].user && meta[0].user.customer) {
                        this.storageService.saveAuthData(meta[0].user);
                        /* HIDE CHAT for now, not used
                        const userName = meta[0].user.customer.fullname;
                        const accountId = meta[0].user.customer.accountId;

                        const payload = {
                        identity: accountId,
                        friendlyName: userName
                        };

                        from(this.authService.getChatAuthToken(payload)).subscribe({
                            next: (data: TokenResponse) => {
                                console.log('getChatAuthToken',data);
                                // this.localstorageService.setChatAuthToken(data)
                                this.storageService.saveChatAuthData(data);
                            },
                                error: (err) => {
                                console.log(err);
                            }
                        }); */
                    }

                    if( meta[0].user?.type === 'employee' || meta[0].user?.type === 'agent') {
                        console.log('Lets Save in LS');
                        this.storageService.saveAuthData(meta[0].user);

                        let userName = meta[0].user[meta[0].user?.type].fullname;
                        let accountId = meta[0].user[meta[0].user?.type].accountId;

                        const payload = {
                        identity: accountId,
                        friendlyName: userName
                        };
                        // use this for chat Auth later
                        console.log('Payload EMP', payload);

                    }
                })
            ),
        // Most effects dispatch another action, but this one is just a "fire and forget" effect
        { dispatch: false }
    );

    // Run this code when getting saved authdata
    getAuthData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getAuthData),
            switchMap(() =>
                // Call the logIn method, convert it to an observable
                from(this.storageService.getAuthData()).pipe(
                    // Take the returned value and return a new success action containing the user
                    map((user) => logInSuccess({ user })),
                    // Or... if it errors return a new failure action containing the error
                    catchError((error) => of(logInError({ error })))
                )
            )
        )
    );

    callChat(){

    }

    // updateProfileData$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(updateProfileInfo),
    //         switchMap(()=>
    //             from(this.storageService.updateUserProfileData())
    //         )
    //     )
    // )


}
