import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData, selectIsAuthenticated } from 'src/app/state/auth/auth.selectors';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  isAuth: Observable<any>;
  isAuthenticated: boolean;

  authData = null;
  userAuthStatus: Observable<any>;


  constructor(
    public authService: AuthService,
    public router: Router,
    private store: Store<AppState>,
  ) {
    this.isAuth = this.store.select(selectIsAuthenticated);
    // this.authService.isAuthenticated.subscribe((auth) => {
    //   this.isAuthenticated = auth;
    // });

    this.userAuthStatus = this.store.select(selectAuthData);
    this.userAuthStatus.subscribe(data => {
      console.log('DATA ========>>>', data);
      this.authData = data;
    })
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(this.authService.isAuthenticated) {
        console.log('this.authData ', this.authData ); 
        console.log('DATA ========>>>', this.authData);
         
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }  
  }
} 
