import { Routes } from '@angular/router';
import { IsActivatedUserGuard } from '../common-module/guards/is-activated-user.guard';

export const launchRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'preload-stream-app',
        canActivate: [IsActivatedUserGuard],
        loadComponent: () => import('./components/preload-main-app/preload-main-app.component').then(m => m.PreloadMainAppComponent)
    },
    {
        path: 'preload-offline-app',
        loadComponent: () => import('./components/preload-offline-app/preload-offline-app.component').then(m => m.PreloadOfflineAppComponent)
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
