import { Routes } from '@angular/router';
import { EditionPageComponent } from './edition-module/edition-page.component';
import { UserPageComponent } from './user-module/user-page.component';

export const mainAppliRoutes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./main-page-module/home-components/home-page/home-page.component').then(m => m.HomePageComponent)
    },
    {
        path: 'search',
        loadComponent: () => import('./main-page-module/search-components/search-page/search-page.component').then(m => m.SearchPageComponent)
    },
    {
        path: 'movies',
        loadComponent: () => import('./main-page-module/media-components/movie-page/movie-page.component').then(m => m.MoviePageComponent)
    },
    {
        path: 'series',
        loadComponent: () => import('./main-page-module/media-components/series-page/series-page.component').then(m => m.SeriesPageComponent)
    },
    {
        path: 'my-list',
        loadComponent: () => import('./main-page-module/my-list-components/my-list-page/my-list-page.component').then(m => m.MyListPageComponent)
    },
    {
        path: 'license/:id',
        loadComponent: () => import('./main-page-module/license-components/license-page/license-page.component').then(m => m.LicensePageComponent)
    },
    {
        path: 'edition',
        component: EditionPageComponent,
        loadChildren: () => import('./edition-module/edition-page.routes').then(m => m.editionRoutes)
    },
    {
        path: 'user',
        component: UserPageComponent,
        loadChildren: () => import('./user-module/user.route').then(m => m.userRoutes)
    },
    {
        path: 'read-video/:mediaType/:id',
        loadComponent: () => import('./video-playing-module/components/video-playing/video-playing.component').then(m => m.VideoPlayingComponent)
    },
    {
        path: 'read-video/:mediaType/:idSeries/:idSeason/:idEpisode',
        loadComponent: () => import('./video-playing-module/components/video-playing/video-playing.component').then(m => m.VideoPlayingComponent)
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
