import { Routes } from '@angular/router';
import { MainAppliComponent } from './main-appli-module/main-appli.component';
import { mainAppliRoutes } from './main-appli-module/main-appli.routes';
import { LaunchPageComponent } from './launch-module/launch-page.component';
import { launchRoutes } from './launch-module/launch-page.routes';
import { IsActivatedUserGuard } from './common-module/guards/is-activated-user.guard';

export const routes: Routes = [
    {
        path: 'main-app',
        canActivate: [IsActivatedUserGuard],
        component: MainAppliComponent,
        children: mainAppliRoutes
    },
    {
        path: 'offline-app',
        loadComponent: () => import('./game-module/game-page.component').then(m => m.GamePageComponent)
    },
    {
        path: 'launch-app',
        component: LaunchPageComponent,
        children: launchRoutes
    },
    {
        path: '',
        redirectTo: 'launch-app',
    }
];
