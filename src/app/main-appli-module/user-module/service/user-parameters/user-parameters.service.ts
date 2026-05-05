import { Injectable } from '@angular/core';
import { MenuTabModel } from '../../../menu-module/model/menu-tab.interface';
import { Router } from '@angular/router';
import { MenuType } from '../../../menu-module/model/menu-type.enum';

@Injectable({
  providedIn: 'root'
})
export class UserParametersService {

  private rootRouter: string = '/main-app/user';
  private rootImage: string = 'icon';

  private userTabMenu: MenuTabModel[] = [
    {
      id: 1,
      name: 'MENU.USER.HISTORIC',
      type: MenuType.HISTORIC,
      route: `${this.rootRouter}/historic`,
      srcImage: `${this.rootImage}/historic.svg`,
      isClicked: false
    },
    {
      id: 2,
      name: 'MENU.USER.MANAGE_PROFIL',
      type: MenuType.PROFIL,
      route: `${this.rootRouter}/edit-profil`,
      srcImage: `${this.rootImage}/edit-profil.svg`,
      isClicked: false
    },
    {
      id: 7,
      name: 'MENU.USER.DOCUMENTATION',
      type: MenuType.DOCUMENTATION,
      route: `${this.rootRouter}/documentation`,
      srcImage: `${this.rootImage}/documentation.svg`,
      isClicked: false
    },
    {
      id: 3,
      name: 'MENU.USER.USER_SUPPORT',
      type: MenuType.USER_SUPPORT,
      route: `${this.rootRouter}/support`,
      srcImage: `${this.rootImage}/support-user.svg`,
      isClicked: false
    },
    {
      id: 4,
      name: "MENU.USER.APP_SETTINGS",
      type: MenuType.PARAM_APPLI,
      route: `${this.rootRouter}/parameter-appli`,
      srcImage: `${this.rootImage}/parameter.svg`,
      isClicked: false
    },
    {
      id: 5,
      name: 'MENU.USER.VIEW_METADAT',
      type: MenuType.META_DATA,
      route: `${this.rootRouter}/view-data`,
      srcImage: `${this.rootImage}/view-data.svg`,
      isClicked: false
    },
    {
      id: 6,
      name: 'MENU.USER.USER_MANAGEMENT',
      type: MenuType.MANAGEMENT_USER,
      route: `${this.rootRouter}/manage-users`,
      srcImage: `${this.rootImage}/manage-users.svg`,
      isClicked: false
    }
  ]

  constructor(private router: Router) { }

  public getAllUserTabMenu(): MenuTabModel[] {
    return this.userTabMenu;
  }

  public navigateByUserTabId(id: number): void {
    const route: string | undefined = this.userTabMenu.find((item: MenuTabModel) => item.id === id)?.route;
    if (route) {
      this.router.navigateByUrl(route);
    }
  }

  public navigateToTabClicked(): void {
    const route: string | undefined = this.userTabMenu.find((item: MenuTabModel) => item.isClicked === true)?.route;
    if (route) {
      this.router.navigateByUrl(route);
    }
  }

  public navigateOnUserPage(): void {
    this.router.navigateByUrl(`${this.rootRouter}/user`);
  }

  public initAllClickedValue(type: MenuType): void {
    this.userTabMenu.forEach((tab: MenuTabModel) => {
      if (tab.type === type) {
        tab.isClicked = true;
      } else {
        tab.isClicked = false;
      }
    })
  }

  public resetAllUserParametersIsClicked(): void {
   this.userTabMenu.forEach((tab: MenuTabModel) => {
      tab.isClicked = false;
    })
  }

}
