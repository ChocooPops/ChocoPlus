import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
    UrlTree,
} from '@angular/router';
import { AuthService } from '../../launch-module/services/auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class IsActivatedUserGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): boolean | UrlTree {
        if (this.authService.isAuthenticated()) {
            return true;
        }
        return this.router.parseUrl('login');
    }
}
