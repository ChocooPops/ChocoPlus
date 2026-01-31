import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { PaginationModel } from '../../../media-module/models/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class PaginationLicenseService {

  private readonly ratioLicenseHome: number = 0.57;
  private readonly ratioLicenseResearch: number = 0.59;

  private homeLicenseGeometricDimensionSubject: BehaviorSubject<GeometricDimensionSelectionModel> = new BehaviorSubject<GeometricDimensionSelectionModel>(this.getInitialHomeLicenseGeometricDimension());
  private homeLicenseGeometricDimension$: Observable<GeometricDimensionSelectionModel> = this.homeLicenseGeometricDimensionSubject.asObservable();

  private researchLicenseGeometricDimensionSubject: BehaviorSubject<GeometricDimensionSelectionModel> = new BehaviorSubject<GeometricDimensionSelectionModel>(this.getInitialResearchLicenseGeometricDimension());
  private researchLicenseGeometricDimension$: Observable<GeometricDimensionSelectionModel> = this.researchLicenseGeometricDimensionSubject.asObservable();

  constructor() {
    this.listenToResize();
    this.onResize();
  }

  //HOME LICENSE;
  private getInitialHomeLicenseGeometricDimension(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 17.5 * this.ratioLicenseHome,
      widthPoster: 17.5,
      nbPosterPerLine: 5,
      gapBetweenPoster: 1.3,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getHomeLicenseGeometricDimensionUnder_1400(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 21.5 * this.ratioLicenseHome,
      widthPoster: 21.5,
      nbPosterPerLine: 4,
      gapBetweenPoster: 1.8,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getHomeLicenseGeometricDimensionUnder_1100(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 28.5 * this.ratioLicenseHome,
      widthPoster: 28.5,
      nbPosterPerLine: 3,
      gapBetweenPoster: 2.4,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getHomeLicenseGeometricDimensionUnder_700(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 42 * this.ratioLicenseHome,
      widthPoster: 42,
      nbPosterPerLine: 2,
      gapBetweenPoster: 3,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }

  //RESEARCH LICENSE;
  private getInitialResearchLicenseGeometricDimension(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 22 * this.ratioLicenseResearch,
      widthPoster: 22,
      nbPosterPerLine: 4,
      gapBetweenPoster: 1.56,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }

  private getResearchLicenseGeometricDimensionUnder_1100(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 28.5 * this.ratioLicenseResearch,
      widthPoster: 28.5,
      nbPosterPerLine: 3,
      gapBetweenPoster: 2,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getResearchLicenseGeometricDimensionUnder_700(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 42 * this.ratioLicenseResearch,
      widthPoster: 42,
      nbPosterPerLine: 2,
      gapBetweenPoster: 2.56,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }

  getHomeLicenseGeometricDimension(): Observable<GeometricDimensionSelectionModel> {
    return this.homeLicenseGeometricDimension$;
  }

  getResearchLicenseGeometricDimension(): Observable<GeometricDimensionSelectionModel> {
    return this.researchLicenseGeometricDimension$;
  }

  private listenToResize(): void {
    fromEvent(window, 'resize')
      .subscribe(() => {
        this.onResize();
      });
  }

  private onResize(): void {
    const width: number = window.innerWidth;
    if (width > 1400) {
      this.updateHomeLicense(this.getInitialHomeLicenseGeometricDimension());
      this.updateResearchLicense(this.getInitialResearchLicenseGeometricDimension());
    } else if (width > 1100) {
      this.updateHomeLicense(this.getHomeLicenseGeometricDimensionUnder_1400());
      this.updateResearchLicense(this.getInitialResearchLicenseGeometricDimension());
    } else if (width > 700) {
      this.updateHomeLicense(this.getHomeLicenseGeometricDimensionUnder_1100());
      this.updateResearchLicense(this.getResearchLicenseGeometricDimensionUnder_1100());
    } else if (width > 500) {
      this.updateHomeLicense(this.getHomeLicenseGeometricDimensionUnder_700());
      this.updateResearchLicense(this.getResearchLicenseGeometricDimensionUnder_700());
    }
  }

  private updateHomeLicense(dimension: GeometricDimensionSelectionModel) {
    if (dimension.heightPoster != this.homeLicenseGeometricDimensionSubject.value.heightPoster) {
      this.homeLicenseGeometricDimensionSubject.next(dimension);
    }
  }

  private updateResearchLicense(dimension: GeometricDimensionSelectionModel) {
    if (dimension.heightPoster != this.researchLicenseGeometricDimensionSubject.value.heightPoster) {
      this.researchLicenseGeometricDimensionSubject.next(dimension)
    }
  }

  private setMarginLeft(widthPoster: number, gapBetweenPoster: number, nbPoster: number): number {
    const withSelection: number = gapBetweenPoster * (nbPoster - 1) + widthPoster * nbPoster;
    return (this.pxTovw(document.documentElement.clientWidth) - withSelection) / 2;
  }

  private pxTovw(px: number): number {
    return (100 * px) / window.innerWidth;
  }

  public setPaginationSelection(nbPagination: number): PaginationModel[] {
    let pagination: PaginationModel[] = [];
    for (let i = 0; i < nbPagination; i++) {
      pagination.push({
        id: i,
        isDisplayed: false
      })
    }
    if (pagination.length > 0) {
      pagination[0].isDisplayed = true;
    }
    return pagination;
  }

  public nextPagination(pagination: PaginationModel[]): void {
    const index = pagination.findIndex(page => page.isDisplayed === true);
    if (pagination[pagination.length - 1] !== pagination[index]) {
      pagination[index].isDisplayed = false;
      pagination[index + 1].isDisplayed = true;
    } else {
      pagination[index].isDisplayed = false;
      pagination[0].isDisplayed = true;
    }
  }

  public beforePagination(pagination: PaginationModel[]): void {
    const index = pagination.findIndex(page => page.isDisplayed === true);
    if (pagination[0] !== pagination[index]) {
      pagination[index].isDisplayed = false;
      pagination[index - 1].isDisplayed = true;
    } else {
      pagination[index].isDisplayed = false;
      pagination[pagination.length - 1].isDisplayed = true;
    }
  }

}
