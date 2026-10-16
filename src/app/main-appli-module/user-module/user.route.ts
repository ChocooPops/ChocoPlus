import { Routes } from "@angular/router";
import { IsAdminGuard } from "../../common-module/guards/is-admin.user.guard";

export const userRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import("../../common-module/components/in-development-page/in-development-page.component").then(m => m.InDevelopmentPageComponent)
    },
    {
        path: 'historic',
        loadComponent: () => import("./components/user-historic-page/user-historic/user-historic.component").then(m => m.UserHistoricComponent)
    },
    {
        path: 'edit-profil',
        loadComponent: () => import("./components/user-profil/user-edit-profil/user-edit-profil.component").then(m => m.UserEditProfilComponent)
    },
    {
        path: 'documentation',
        loadComponent: () => import("./components/documentation/documentation.component").then(m => m.DocumentationComponent)
    },
    {
        path: 'support',
        loadComponent: () => import("./components/user-support/user-support.component").then(m => m.UserSupportComponent)
    },
    {
        path : 'parameter-appli',
        loadComponent: () => import("./components/user-parameters-app/parameter-appli/parameter-appli.component").then(m => m.ParameterAppliComponent)
    },
    {
        path: 'view-data',
        loadComponent: () => import("./components/view-data-page/view-data/view-data.component").then(m => m.ViewDataComponent)
    },
    {
        path: 'manage-users',
        canActivate: [IsAdminGuard],
        loadComponent: () => import("./components/users-manage-page/users-manage/users-manage.component").then(m => m.UsersManageComponent)
    },
    {
        path: 'unauthorized',
        loadComponent: () => import("../../common-module/components/unauthorized-page/unauthorized-page.component").then(m => m.UnauthorizedPageComponent)
    },
    {
        path: '**',
        loadComponent: () => import("../../common-module/components/setting-not-found/setting-not-found.component").then(m => m.SettingNotFoundComponent)
    }
]