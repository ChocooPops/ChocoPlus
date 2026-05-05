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
      name: "MENU.EDIT.ADVANCED_SETTINGS",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.MEDIA_LIBRARY",
          type: MenuType.LIBRARY,
          route: 'library',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.VERSION",
          type: MenuType.VERSION,
          route: 'version',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.JELLYFIN_PARAMETERS",
          type: MenuType.PARAM_JELLYFIN,
          route: 'manager-jellyfin',
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "MENU.EDIT.NEWS_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_NEWS_HOME",
          type: MenuType.MODIFY_NEWS_HOME,
          route: 'modify-news',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_NEW_MOVIES",
          type: MenuType.MODIFY_NEW_MOVIES,
          route: 'modify-news-movie-running',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_NEW_SERIES",
          type: MenuType.MODIFY_NEW_SERIES,
          route: 'modify-news-series-running',
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "MENU.EDIT.CATEGORY_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.ADD_CATEGORY",
          type: MenuType.ADD_CATEGORY,
          route: "add-category",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_CATEGORY",
          type: MenuType.MODIFY_CATEGORY,
          route: "modify-category",
          isClicked: false
        }
      ]
    },

    {
      id: this.getId(),
      name: "MENU.EDIT.MOVIE_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.ADD_MOVIE",
          type: MenuType.ADD_MOVIE,
          route: "add-movie",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_MOVIE",
          type: MenuType.MODIFY_MOVIE,
          route: "modify-movie",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "MENU.EDIT.SERIES_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.ADD_SERIES",
          type: MenuType.ADD_SERIES,
          route: "add-series",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_SERIES",
          type: MenuType.MODIFY_SERIES,
          route: "modify-series",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "MENU.EDIT.CREDIT_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.ADD_CREDIT",
          type: MenuType.ADD_CREDIT,
          route: "add-credit",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_CREDIT",
          type: MenuType.MODIFY_CREDIT,
          route: "modify-credit",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "MENU.EDIT.SELECTION_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.ADD_SELECTION",
          type: MenuType.ADD_SELECTION,
          route: "create-selection",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_SELECTION",
          type: MenuType.MODIFY_SELECTION,
          route: "modify-selection",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "MENU.EDIT.LICENSE_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.ADD_LICENSE",
          type: MenuType.ADD_LICENSE,
          route: "create-license",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_LICENSE",
          type: MenuType.MODIFY_LICENSE,
          route: "modify-license",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_LICENSE",
          type: MenuType.MODIFY_ORDER_LICENSE,
          route: "modify-license-order",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "MENU.EDIT.HOME_PAGE_MANAGEMENT",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "MENU.EDIT.MODIFY_HOME_PAGE_SELECTION",
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
