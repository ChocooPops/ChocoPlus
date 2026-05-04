import { Injectable } from '@angular/core';
import { EditionParameterModel } from '../../models/editionParamater.interface';
import { Router } from '@angular/router';
import { MenuTabModel } from '../../../menu-module/model/menu-tab.interface';
import { MenuType } from '../../../menu-module/model/menu-type.enum';

@Injectable({
  providedIn: 'root'
})
export class EditionParametersService {

  constructor(private router: Router) { }

  private rootRouter: string = '/main-app/edition';
  private id: number = 0;

  private getId(): number {
    this.id++;
    return this.id;
  }

  private editionParameters: EditionParameterModel[] = [
    {
      id: this.getId(),
      name: "Paramètres avancés",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Médiathèque",
          type: MenuType.LIBRARY,
          route: 'library',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Version",
          type: MenuType.VERSION,
          route: 'version',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Paramètre Jellyfin",
          type: MenuType.PARAM_JELLYFIN,
          route: 'manager-jellyfin',
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Gestion des news",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Modifer les news d'accueil",
          type: MenuType.MODIFY_NEWS_HOME,
          route: 'modify-news',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifer les news des films",
          type: MenuType.MODIFY_NEW_MOVIES,
          route: 'modify-news-movie-running',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifer les news des séries",
          type: MenuType.MODIFY_NEW_SERIES,
          route: 'modify-news-series-running',
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Gestion de vos catégories",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Ajouter une catégorie",
          type: MenuType.ADD_CATEGORY,
          route: "add-category",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une catégorie",
          type: MenuType.MODIFY_CATEGORY,
          route: "modify-category",
          isClicked: false
        }
      ]
    },

    {
      id: this.getId(),
      name: "Gestion des films",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Ajouter un film",
          type: MenuType.ADD_MOVIE,
          route: "add-movie",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier un film",
          type: MenuType.MODIFY_MOVIE,
          route: "modify-movie",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Gestion des séries",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Ajouter une série",
          type: MenuType.ADD_SERIES,
          route: "add-series",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une séries",
          type: MenuType.MODIFY_SERIES,
          route: "modify-series",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Gestions des crédits",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Ajouter un crédit",
          type: MenuType.ADD_CREDIT,
          route: "add-credit",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modificer un crédit",
          type: MenuType.MODIFY_CREDIT,
          route: "modify-credit",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Gérer les sélections personnalisées",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Créer une sélection",
          type: MenuType.ADD_SELECTION,
          route: "create-selection",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une sélection",
          type: MenuType.MODIFY_SELECTION,
          route: "modify-selection",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Gérer vos licences personnalisées",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Créer une licence",
          type: MenuType.ADD_LICENSE,
          route: "create-license",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une licence",
          type: MenuType.MODIFY_LICENSE,
          route: "modify-license",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier l'ordre des licenses",
          type: MenuType.MODIFY_ORDER_LICENSE,
          route: "modify-license-order",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Gérer la création de page",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Page d'accueil",
          type: MenuType.MODIFY_HOME_PAGE_SELECTION,
          route: "modify-home-page",
          isClicked: false
        }
      ]
    }
  ]

  public getAllEditionParameters(): EditionParameterModel[] {
    return this.editionParameters;
  }

  public toggleIfParameterIsClickedById(id: number): void {
    const index = this.editionParameters.findIndex(param => param.id === id);
    this.editionParameters[index].isClicked = !this.editionParameters[index].isClicked;
  }

  public navigateByUrlFromUnderParameters(idParam: number, idUnderParam: number): void {
    // for (let editionParameter of this.editionParameters) {
    //   for (let underParameter of editionParameter.underParameter) {
    //     underParameter.isClicked = false;
    //   }
    // }
    const indexParam = this.editionParameters.findIndex(param => param.id === idParam);
    const indexUnderParam = this.editionParameters[indexParam].underParameter.findIndex(param => param.id === idUnderParam)
    //this.editionParameters[indexParam].underParameter[indexUnderParam].isClicked = !this.editionParameters[indexParam].underParameter[indexUnderParam].isClicked;

    const route: string = this.editionParameters[indexParam].underParameter[indexUnderParam].route;
    this.router.navigateByUrl(`${this.rootRouter}/${route}`);
  }

  public toggleIfUnderParameterIsClickedByType(type: MenuType): void {
    for (let editionParameter of this.editionParameters) {
      for (let underParameter of editionParameter.underParameter) {
        if (underParameter.type === type) {
          underParameter.isClicked = true;
          editionParameter.isClicked = true;
        } else {
          underParameter.isClicked = false;
        }
      }
    }
  }

  public resetAllUnderParameterIsClicked(): void {
    for (let editionParameter of this.editionParameters) {
      for (let underParameter of editionParameter.underParameter) {
        underParameter.isClicked = false;
      }
    }
  }

  public openSpecifiqParametersById(idParam: number, idUnderParam: number): string {
    const indexParam = this.editionParameters.findIndex((param) => param.id === idParam);
    this.editionParameters[indexParam].isClicked = true;
    for (let editionParameter of this.editionParameters) {
      for (let underParameter of editionParameter.underParameter) {
        underParameter.isClicked = false;
      }
    }
    const indexUnderParam = this.editionParameters[indexParam].underParameter.findIndex(param => param.id === idUnderParam)
    this.editionParameters[indexParam].underParameter[indexUnderParam].isClicked = true;
    return this.editionParameters[indexParam].underParameter[indexUnderParam].route;
  }

  public navigateToEditionByType(idMovie: number, type: MenuType): void {
    let menu!: MenuTabModel;
    for (let editionParameter of this.editionParameters) {
      for (let underParameter of editionParameter.underParameter) {
        if (underParameter.type === type) {
          menu = underParameter;
          break;
        }
      }
    }
    if (menu) {
      this.router.navigate([`${this.rootRouter}/${menu.route}`, idMovie]);
    }
  }

  public navigateToUnderParametersClicked(): void {
    let underParamClicked !: MenuTabModel;
    this.editionParameters.forEach((param: EditionParameterModel) => {
      param.underParameter.forEach((underParam: MenuTabModel) => {
        if (underParam.isClicked) {
          underParamClicked = underParam;
        }
      })
    })
    if (underParamClicked) {
      this.router.navigateByUrl(`${this.rootRouter}/${underParamClicked.route}`);
    }
  }

}
