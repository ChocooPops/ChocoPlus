import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../launch-module/services/auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class IsAdminGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        if (this.authService.isAdmin()) {
            return true;
        }
        const currentPath = state.url;
        const segments = currentPath.split('/').filter(Boolean);
        segments.pop();
        const newPath = '/' + segments.join('/') + '/unauthorized';
        return this.router.parseUrl(newPath);
    }
}
