import { Routes } from '@angular/router';

export const offlineAppliRoutes: Routes = [
  {
    path: 'game',
    loadComponent: () =>
      import('./../offline-appli-module/game-module/game-page.component').then(
        (m) => m.GamePageComponent,
      ),
  },
  {
    path: 'downloads',
    loadComponent: () =>
      import('./../main-appli-module/main-page-module/download-components/downloaded-media-page/downloaded-media-page.component').then(
        (m) => m.DownloadedMediaPageComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'game',
    pathMatch: 'full',
  },
];
