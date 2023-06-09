import { TokenService } from './../services/token.service';
import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private tokenService: TokenService , private router:Router) { }
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token = this.tokenService.getToken(); // get token from cookie
    if (!token) {
      this.router.navigate(['/']); // if token is not present navigate to login
      return false
    }
    return true;
    
  }

}
