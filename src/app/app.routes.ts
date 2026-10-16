import { Routes } from '@angular/router';
import { IsActivatedUserGuard } from './common-module/guards/is-activated-user.guard';

export const routes: Routes = [
    {
        path: 'main-app',
        canActivate: [IsActivatedUserGuard],
        loadComponent: () => import('./main-appli-module/main-appli.component').then(m => m.MainAppliComponent),
        loadChildren: () => import('./main-appli-module/main-appli.routes').then(m => m.mainAppliRoutes)
    },
    {
        path: 'offline-app',
        loadComponent: () => import('./offline-appli-module/offline-appli.component').then(m => m.OfflineAppliComponent),
        loadChildren: () => import('./offline-appli-module/offline-appli.routes').then(m => m.offlineAppliRoutes)
    },
    {
        path: 'launch-app',
        loadComponent: () => import('./launch-module/launch-page.component').then(m => m.LaunchPageComponent),
        loadChildren: () => import('./launch-module/launch-page.routes').then(m => m.launchRoutes)
    },
    {
        path: '',
        redirectTo: 'launch-app',
    }
];
