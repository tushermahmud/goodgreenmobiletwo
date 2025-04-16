import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import { selectIsAuthenticated } from 'src/app/state/auth/auth.selectors';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  isAuth: Observable<any>;
  isAuthenticated: boolean = false;

  constructor(
    public authService: AuthService,
    public router: Router,
    private store: Store<AppState>,
  ) {
    this.isAuth = this.store.select(selectIsAuthenticated);
    this.isAuth.subscribe((auth) => {
      this.isAuthenticated = auth;
    });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(!this.isAuthenticated) {
        this.router.navigate(['/login']);
        return false;
      }
      console.log('USER AUTHENTICATED');
      
      return true;
  }
}
