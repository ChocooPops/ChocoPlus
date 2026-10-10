import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../launch-module/services/auth/auth.service';
import { VerifUserAlreadyConnectedService } from '../../launch-module/services/verif-user-already-connected/verif-user-already-connected.service';

@Injectable({
    providedIn: 'root',
})
export class IsActivatedUserGuard implements CanActivate {

    constructor(private readonly authService: AuthService, 
        private readonly router: Router,
        private readonly verifUserAlreadyConnectedService: VerifUserAlreadyConnectedService) { }

    canActivate(): boolean | UrlTree {
        if (this.authService.isAuthenticated()) {
            this.verifUserAlreadyConnectedService.setUserConnected(true);
            return true;
        }
        this.verifUserAlreadyConnectedService.setUserConnected(false);
        return this.router.parseUrl('login');
    }
}
