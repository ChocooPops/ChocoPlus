import { Injectable } from '@angular/core';
import { MenuTabModel } from '../../../menu-module/model/menu-tab.interface';
import { Router } from '@angular/router';

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
      route: `${this.rootRouter}/historic`,
      srcImage: `${this.rootImage}/historic.svg`,
      isClicked: false
    },
    {
      id: 2,
      name: 'Gérer le profil',
      route: `${this.rootRouter}/edit-profil`,
      srcImage: `${this.rootImage}/edit-profil.svg`,
      isClicked: false
    },
    {
      id: 3,
      name: 'Support utilisateur',
      route: `${this.rootRouter}/support`,
      srcImage: `${this.rootImage}/support-user.svg`,
      isClicked: false
    },
    {
      id: 4,
      name: "Paramètre de l'application",
      route: `${this.rootRouter}/parameter-appli`,
      srcImage: `${this.rootImage}/parameter.svg`,
      isClicked: false
    },
    {
      id: 5,
      name: 'Visualiser les metadonnées',
      route: `${this.rootRouter}/view-data`,
      srcImage: `${this.rootImage}/view-data.svg`,
      isClicked: false
    },
    {
      id: 6,
      name: 'Gestion des utilisateurs',
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
      this.initAllClickedValue(id);
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

  public initAllClickedValue(id: number): void {
    this.userTabMenu.forEach((tab: MenuTabModel) => {
      if (tab.id === id) {
        tab.isClicked = true;
      } else {
        tab.isClicked = false;
      }
    })
  }

}
