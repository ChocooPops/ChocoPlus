import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { PreloadMainAppComponent } from './components/preload-main-app/preload-main-app.component';
import { LoginComponent } from './components/login/login.component';
import { PreloadOfflineAppComponent } from './components/preload-offline-app/preload-offline-app.component';
import { IsActivatedUserGuard } from '../common-module/guards/is-activated-user.guard';

export const launchRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'preload-stream-app',
        canActivate: [IsActivatedUserGuard],
        component: PreloadMainAppComponent
    },
    {
        path: 'preload-offline-app',
        component: PreloadOfflineAppComponent
    }
];
