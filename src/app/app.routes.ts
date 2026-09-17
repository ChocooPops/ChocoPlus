import { Routes } from '@angular/router';
import { MainAppliComponent } from './main-appli-module/main-appli.component';
import { mainAppliRoutes } from './main-appli-module/main-appli.routes';
import { LaunchPageComponent } from './launch-module/launch-page.component';
import { launchRoutes } from './launch-module/launch-page.routes';
import { IsActivatedUserGuard } from './common-module/guards/is-activated-user.guard';
import { OfflineAppliComponent } from './offline-appli-module/offline-appli.component';
import { offlineAppliRoutes } from './offline-appli-module/offline-appli.routes';

export const routes: Routes = [
    {
        path: 'main-app',
        canActivate: [IsActivatedUserGuard],
        component: MainAppliComponent,
        children: mainAppliRoutes
    },
    {
        path: 'offline-app',
        component: OfflineAppliComponent,
        children: offlineAppliRoutes
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
