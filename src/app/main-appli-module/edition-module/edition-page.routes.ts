import { Routes } from "@angular/router";
import { SettingModifyOrderLicenseComponent } from './components/setting-modify-order-license/setting-modify-order-license.component';
import { SettingAddCategoryComponent } from './components/setting-add-category/setting-add-category.component';
import { SettingModifyCategoryComponent } from './components/setting-modify-category/setting-modify-category.component';
import { SettingAddSelectionComponent } from './components/setting-add-selection/setting-add-selection.component';
import { SettingAddLicenseComponent } from './components/setting-add-license/setting-add-license.component';
import { SettingModifyMovieComponent } from './components/setting-modify-movie/setting-modify-movie.component';
import { SettingModifySelectionComponent } from './components/setting-modify-selection/setting-modify-selection.component';
import { SettingModifyLicenseComponent } from './components/setting-modify-license/setting-modify-license.component';
import { SettingAddMovieComponent } from './components/setting-add-movie/setting-add-movie.component';
import { SettingNotFoundComponent } from '../../common-module/components/setting-not-found/setting-not-found.component';
import { SettingModifyNewsComponent } from "./components/setting-modify-news/setting-modify-news.component";
import { SettingAddSeriesComponent } from "./components/setting-add-series/setting-add-series.component";
import { SettingModifySeriesComponent } from "./components/setting-modify-series/setting-modify-series.component";
import { SettingModifyNewsMovieRunningComponent } from "./components/setting-modify-news-movie-running/setting-modify-news-movie-running.component";
import { SettingModifyNewsSeriesRunningComponent } from "./components/setting-modify-news-series-running/setting-modify-news-series-running.component";
import { SettingModifyHomePageSelectionsComponent } from "./components/setting-modify-home-page-selections/setting-modify-home-page-selections.component";

export const editionRoutes: Routes = [
    {
        path: 'modify-news',
        component: SettingModifyNewsComponent
    },
    {
        path: 'add-category',
        component: SettingAddCategoryComponent
    },
    {
        path: 'modify-category',
        children: [
            { path: ':id', component: SettingModifyCategoryComponent },
            { path: '', component: SettingModifyCategoryComponent }
        ]
    },
    {
        path: 'add-movie',
        component: SettingAddMovieComponent
    },
    {
        path: 'create-selection',
        component: SettingAddSelectionComponent
    },
    {
        path: 'add-series',
        component: SettingAddSeriesComponent
    },
    {
        path: 'modify-series',
        children: [
            { path: ':id', component: SettingModifySeriesComponent },
            { path: '', component: SettingModifySeriesComponent }
        ]
    },
    {
        path: 'create-license',
        component: SettingAddLicenseComponent
    },
    {
        path: 'modify-movie',
        children: [
            { path: ':id', component: SettingModifyMovieComponent },
            { path: '', component: SettingModifyMovieComponent }
        ]
    },
    {
        path: 'modify-selection',
        children: [
            { path: ':id', component: SettingModifySelectionComponent },
            { path: '', component: SettingModifySelectionComponent }
        ]
    },
    {
        path: 'modify-license',
        children: [
            { path: ':id', component: SettingModifyLicenseComponent },
            { path: '', component: SettingModifyLicenseComponent }
        ]
    },
    {
        path: 'modify-license-order',
        component: SettingModifyOrderLicenseComponent
    },
    {
        path: 'modify-news-movie-running',
        component: SettingModifyNewsMovieRunningComponent
    },
    {
        path: 'modify-news-series-running',
        component: SettingModifyNewsSeriesRunningComponent
    },
    {
        path: 'modify-home-page',
        component: SettingModifyHomePageSelectionsComponent
    },
    {
        path: 'manager-jellyfin',
        loadComponent: () => import('./components/setting-manager-jellyfin/setting-manager-jellyfin.component').then(m => m.SettingManagerJellyfinComponent)
    },
    {
        path: '**',
        component: SettingNotFoundComponent
    }
]