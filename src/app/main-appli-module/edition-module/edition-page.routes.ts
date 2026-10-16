import { Routes } from "@angular/router";
import { IsAdminGuard } from "../../common-module/guards/is-admin.user.guard";

export const editionRoutes: Routes = [
    {
        path: 'modify-news',
        loadComponent: () => import("./components/setting-modify-news/setting-modify-news.component").then(m => m.SettingModifyNewsComponent)
    },
    {
        path: 'add-category',
        loadComponent: () => import("./components/setting-add-category/setting-add-category.component").then(m => m.SettingAddCategoryComponent)
    },
    {
        path: 'modify-category',
        children: [
            { 
                path: ':id', 
                loadComponent: () => import("./components/setting-modify-category/setting-modify-category.component").then(m => m.SettingModifyCategoryComponent) 
            },
            { 
                path: '', 
                loadComponent: () => import("./components/setting-modify-category/setting-modify-category.component").then(m => m.SettingModifyCategoryComponent) 
            }
        ]
    },
    {
        path: 'add-movie',
        loadComponent: () => import("./components/setting-add-movie/setting-add-movie.component").then(m => m.SettingAddMovieComponent)
    },
    {
        path: 'create-selection',
        loadComponent: () => import("./components/setting-add-selection/setting-add-selection.component").then(m => m.SettingAddSelectionComponent)
    },
    {
        path: 'add-series',
        loadComponent: () => import("./components/setting-add-series/setting-add-series.component").then(m => m.SettingAddSeriesComponent)
    },
    {
        path: 'modify-series',
        children: [
            { 
                path: ':id', 
                loadComponent: () => import("./components/setting-modify-series/setting-modify-series.component").then(m => m.SettingModifySeriesComponent) 
            },
            { 
                path: '', 
                loadComponent: () => import("./components/setting-modify-series/setting-modify-series.component").then(m => m.SettingModifySeriesComponent) 
            }
        ]
    },
    {
        path: 'add-credit',
        loadComponent: () => import("./components/setting-add-credit/setting-add-credit.component").then(m => m.SettingAddCreditComponent)
    },
    {
        path: 'modify-credit',
        children: [
            { 
                path: ':id', 
                loadComponent: () => import("./components/setting-modify-credit/setting-modify-credit.component").then(m => m.SettingModifyCreditComponent) 
            },
            { 
                path: '', 
                loadComponent: () => import("./components/setting-modify-credit/setting-modify-credit.component").then(m => m.SettingModifyCreditComponent) 
            }
        ]
    },
    {
        path: 'create-license',
        loadComponent: () => import("./components/setting-add-license/setting-add-license.component").then(m => m.SettingAddLicenseComponent)
    },
    {
        path: 'modify-movie',
        children: [
            { 
                path: ':id', 
                loadComponent: () => import("./components/setting-modify-movie/setting-modify-movie.component").then(m => m.SettingModifyMovieComponent) 
            },
            { 
                path: '', 
                loadComponent: () => import("./components/setting-modify-movie/setting-modify-movie.component").then(m => m.SettingModifyMovieComponent) 
            }
        ]
    },
    {
        path: 'modify-selection',
        children: [
            { 
                path: ':id', 
                loadComponent: () => import("./components/setting-modify-selection/setting-modify-selection.component").then(m => m.SettingModifySelectionComponent) 
            },
            { 
                path: '', 
                loadComponent: () => import("./components/setting-modify-selection/setting-modify-selection.component").then(m => m.SettingModifySelectionComponent) 
            }
        ]
    },
    {
        path: 'modify-license',
        children: [
            { 
                path: ':id', 
                loadComponent: () => import("./components/setting-modify-license/setting-modify-license.component").then(m => m.SettingModifyLicenseComponent) 
            },
            { 
                path: '', 
                loadComponent: () => import("./components/setting-modify-license/setting-modify-license.component").then(m => m.SettingModifyLicenseComponent) 
            }
        ]
    },
    {
        path: 'modify-license-order',
        loadComponent: () => import("./components/setting-modify-order-license/setting-modify-order-license.component").then(m => m.SettingModifyOrderLicenseComponent)
    },
    {
        path: 'modify-news-movie-running',
        loadComponent: () => import("./components/setting-modify-news-movie-running/setting-modify-news-movie-running.component").then(m => m.SettingModifyNewsMovieRunningComponent)
    },
    {
        path: 'modify-news-series-running',
        loadComponent: () => import("./components/setting-modify-news-series-running/setting-modify-news-series-running.component").then(m => m.SettingModifyNewsSeriesRunningComponent)
    },
    {
        path: 'modify-home-page',
        loadComponent: () => import("./components/setting-modify-home-page-selections/setting-modify-home-page-selections.component").then(m => m.SettingModifyHomePageSelectionsComponent)
    },
    {
        path: 'library',
        canActivate: [IsAdminGuard],
        loadComponent: () => import('./components/library/setting-edit-library/setting-edit-library.component').then(m => m.SettingEditLibraryComponent)
    },
    {
        path: 'version',
        canActivate: [IsAdminGuard],
        loadComponent: () => import("./components/setting-modify-version/setting-modify-version.component").then(m => m.SettingModifyVersionComponent)
    },
    {
        path: 'admin-params',
        canActivate: [IsAdminGuard],
        loadComponent: () => import('./components/setting-admin-params/setting-admin-params.component').then(m => m.SettingAdminParamsComponent)
    },
    {
        path: 'unauthorized',
        loadComponent: () => import("../../common-module/components/unauthorized-page/unauthorized-page.component").then(m => m.UnauthorizedPageComponent)
    },
    {
        path: '**',
        loadComponent: () => import("../../common-module/components/setting-not-found/setting-not-found.component").then(m => m.SettingNotFoundComponent)
    }
];