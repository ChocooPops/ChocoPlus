import { Routes } from "@angular/router";
import { InDevelopmentPageComponent } from "../../common-module/components/in-development-page/in-development-page.component";
import { SettingNotFoundComponent } from "../../common-module/components/setting-not-found/setting-not-found.component";
import { UserHistoricComponent } from "./components/user-historic/user-historic.component";
import { UserEditProfilComponent } from "./components/user-edit-profil/user-edit-profil.component";
import { UserSupportComponent } from "./components/user-support/user-support.component";
import { UsersManageComponent } from "./components/users-manage-page/users-manage/users-manage.component";
import { ViewDataComponent } from "./components/view-data-page/view-data/view-data.component";
import { IsAdminGuard } from "../../common-module/guards/is-admin.user.guard";
import { UnauthorizedPageComponent } from "../../common-module/components/unauthorized-page/unauthorized-page.component";
import { ParameterAppliComponent } from "./components/parameter-appli/parameter-appli.component";

export const userRoutes: Routes = [
    {
        path: '',
        component: InDevelopmentPageComponent
    },
    {
        path: 'historic',
        component: UserHistoricComponent
    },
    {
        path: 'edit-profil',
        component: UserEditProfilComponent
    },
    {
        path: 'support',
        component: UserSupportComponent
    },
    {
        path : 'parameter-appli',
        component : ParameterAppliComponent
    },
    {
        path: 'view-data',
        component: ViewDataComponent
    },
    {
        path: 'manage-users',
        canActivate: [IsAdminGuard],
        component: UsersManageComponent
    },
    {
        path: 'unauthorized',
        component: UnauthorizedPageComponent,
    },
    {
        path: '**',
        component: SettingNotFoundComponent
    }
]