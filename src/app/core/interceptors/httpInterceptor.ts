import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../services/storage/storage-service.service';
import { AuthState } from 'src/app/state/auth/auth.state';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    getAuthState: Observable<AuthState>;
    authData: AuthState;
    isTokenExpired:boolean = false;

    constructor(
        private authService: AuthService,
        private store: Store<AppState>,
    ) {
        this.getAuthState = this.store.select(selectAuthData);
        this.getAuthState.subscribe(d => this.authData = d)
    }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Reqeust to avoid JWT token authentication
        if (req.headers.get('skip') ||
            (
                req.url.indexOf(environment.ggCoreEndpoint) === -1
                // && req.url.indexOf(environment.ggIDMEndpoint) === -1
                && req.url.indexOf(environment.ggIntegrationEndpoint) === -1
                && req.url.indexOf(environment.ggIntegrationsChat) === -1
                && req.url.indexOf(environment.ggOpportunityEndpoint) === -1
            )
        ) {
            if (req.headers.get('type') !== 'no-cache') {
                return next.handle(req);
            }
        }
        const token = this.authData.authMeta.accessToken;
        if (this.authData?.isAuthenticated) {
            this.isTokenExpired = this.tokenExpired(String(token))
            console.log('isExpired',this.isTokenExpired);
            if(this.isTokenExpired){
                //call refresh token api
            }
        }
        if(token) {
            const headers = new HttpHeaders({
                'Authorization' : `Bearer ${token}`,
                // 'Content-Type': 'application/json'
            })
              
            req = req.clone({headers});
        }
        
        return next.handle(req).pipe(

            tap(x=> console.log('handler tap',x)),
            catchError((err) => {
              if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
                  // redirect user to the logout page, becuse at this point the auth token is not authentic/secured 
               }
              }
              //return throwError(() => { new Error(err)});
              throw err;
            })
        );
    }


    private tokenExpired(token: string) {
        const expiry = (JSON.parse(atob(token?.split('.')[1]))).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }
}
