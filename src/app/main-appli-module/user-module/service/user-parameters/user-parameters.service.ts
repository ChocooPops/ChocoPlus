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
      name: 'Historique',
      type: MenuType.HISTORIC,
      route: `${this.rootRouter}/historic`,
      srcImage: `${this.rootImage}/historic.svg`,
      isClicked: false
    },
    {
      id: 2,
      name: 'Gérer le profil',
      type: MenuType.PROFIL,
      route: `${this.rootRouter}/edit-profil`,
      srcImage: `${this.rootImage}/edit-profil.svg`,
      isClicked: false
    },
    {
      id: 7,
      name: 'Documentation',
      type: MenuType.DOCUMENTATION,
      route: `${this.rootRouter}/documentation`,
      srcImage: `${this.rootImage}/documentation.svg`,
      isClicked: false
    },
    {
      id: 3,
      name: 'Support utilisateur',
      type: MenuType.USER_SUPPORT,
      route: `${this.rootRouter}/support`,
      srcImage: `${this.rootImage}/support-user.svg`,
      isClicked: false
    },
    {
      id: 4,
      name: "Paramètres de l'application",
      type: MenuType.PARAM_APPLI,
      route: `${this.rootRouter}/parameter-appli`,
      srcImage: `${this.rootImage}/parameter.svg`,
      isClicked: false
    },
    {
      id: 5,
      name: 'Visualiser les metadonnées',
      type: MenuType.META_DATA,
      route: `${this.rootRouter}/view-data`,
      srcImage: `${this.rootImage}/view-data.svg`,
      isClicked: false
    },
    {
      id: 6,
      name: 'Gestion des utilisateurs',
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

}
