import { Injectable } from '@angular/core';
import { EditionParameterModel } from '../../models/editionParamater.interface';
import { Router } from '@angular/router';
import { MenuTabModel } from '../../../menu-module/model/menu-tab.interface';

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
      name: "Gestion des news",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Modifer les news d'accueil",
          route: 'modify-news',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifer les news des films",
          route: 'modify-news-movie-running',
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifer les news des séries",
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
          route: "add-category",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une catégorie",
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
          route: "add-movie",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier un film",
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
          route: "add-series",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une séries",
          route: "modify-series",
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
          route: "create-selection",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une sélection",
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
          route: "create-license",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier une licence",
          route: "modify-license",
          isClicked: false
        },
        {
          id: this.getId(),
          name: "Modifier l'ordre des licenses",
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
          route: "modify-home-page",
          isClicked: false
        }
      ]
    },
    {
      id: this.getId(),
      name: "Paramètres avancés",
      isClicked: false,
      underParameter: [
        {
          id: this.getId(),
          name: "Paramètre Jellyfin",
          route: 'manager-jellyfin',
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

  public toggleIfUnderParameterIsClickedById(idParam: number, idUnderParam: number): void {
    for (let editionParameter of this.editionParameters) {
      for (let underParameter of editionParameter.underParameter) {
        underParameter.isClicked = false;
      }
    }
    const indexParam = this.editionParameters.findIndex(param => param.id === idParam);
    const indexUnderParam = this.editionParameters[indexParam].underParameter.findIndex(param => param.id === idUnderParam)
    this.editionParameters[indexParam].underParameter[indexUnderParam].isClicked = !this.editionParameters[indexParam].underParameter[indexUnderParam].isClicked;

    const route: string = this.editionParameters[indexParam].underParameter[indexUnderParam].route;
    this.router.navigateByUrl(`${this.rootRouter}/${route}`);
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

  public navigateToModifyMovie(idMovie: number): void {
    const indexParam: number = this.editionParameters[2].id;
    const indexUnderParam: number = this.editionParameters[2].underParameter[1].id;
    const route: string = this.openSpecifiqParametersById(indexParam, indexUnderParam);
    this.router.navigate([`${this.rootRouter}/${route}`, idMovie]);
  }

  public navigateToModifySeries(idSeries: number): void {
    const indexParam: number = this.editionParameters[3].id;
    const indexUnderParam: number = this.editionParameters[3].underParameter[1].id;
    const route: string = this.openSpecifiqParametersById(indexParam, indexUnderParam);
    this.router.navigate([`${this.rootRouter}/${route}`, idSeries]);
  }

  public navigateToModifyCategory(idCategory: number): void {
    const indexParam: number = this.editionParameters[1].id;
    const indexUnderParam: number = this.editionParameters[1].underParameter[1].id;
    const route: string = this.openSpecifiqParametersById(indexParam, indexUnderParam);
    this.router.navigate([`${this.rootRouter}/${route}`, idCategory]);
  }

  public navigateToModifySelection(idSelection: number): void {
    const indexParam: number = this.editionParameters[4].id;
    const indexUnderParam: number = this.editionParameters[4].underParameter[1].id;
    const route: string = this.openSpecifiqParametersById(indexParam, indexUnderParam);
    this.router.navigate([`${this.rootRouter}/${route}`, idSelection]);
  }

  public navigateToModifyLicense(idLicense: number): void {
    const indexParam: number = this.editionParameters[5].id;
    const indexUnderParam: number = this.editionParameters[5].underParameter[1].id;
    const route: string = this.openSpecifiqParametersById(indexParam, indexUnderParam);
    this.router.navigate([`${this.rootRouter}/${route}`, idLicense]);
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
