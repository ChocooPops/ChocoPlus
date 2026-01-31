import { Injectable } from '@angular/core';
import { PaginationModel } from '../../models/pagination.interface';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../models/geometric-dimension-selection.interface';

@Injectable({
  providedIn: 'root'
})
export class PaginationPosterService {

  constructor() {
    this.listenToResize();
    this.onResize();
  }

  private readonly rationVerticalPoster: number = 1.817;
  private readonly ratioSpecialPoster: number = 1.512;
  private readonly ratioLicensePoster: number = 1.516;
  private readonly ratioHorizontalePoster: number = 0.7;

  private verticalGeometricDimensionSubject: BehaviorSubject<GeometricDimensionSelectionModel> = new BehaviorSubject<GeometricDimensionSelectionModel>(this.getInitialVerticalGeometricDimension());
  private verticalGeometricDimension$: Observable<GeometricDimensionSelectionModel> = this.verticalGeometricDimensionSubject.asObservable();

  private specialGeometricDimensionSubject: BehaviorSubject<GeometricDimensionSelectionModel> = new BehaviorSubject<GeometricDimensionSelectionModel>(this.getInitialSpecialGeometricDimension());
  private specialGeometricDimension$: Observable<GeometricDimensionSelectionModel> = this.specialGeometricDimensionSubject.asObservable();

  private licenseGeometricDimensionSubject: BehaviorSubject<GeometricDimensionSelectionModel> = new BehaviorSubject<GeometricDimensionSelectionModel>(this.getInitialLicenseGeometricDimension());
  private licenseGeometricDimension$: Observable<GeometricDimensionSelectionModel> = this.licenseGeometricDimensionSubject.asObservable();

  private horizontalGeometricDimensionSubject: BehaviorSubject<GeometricDimensionSelectionModel> = new BehaviorSubject<GeometricDimensionSelectionModel>(this.getInitialHorizontalGeometricDimension());
  private horizontalGeometricDimension$: Observable<GeometricDimensionSelectionModel> = this.horizontalGeometricDimensionSubject.asObservable();

  ///////////DIMENSION GEOMETRIC DES POSTERS NORMAUX;
  private getInitialVerticalGeometricDimension(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 10 * this.rationVerticalPoster,
      widthPoster: 10,
      nbPosterPerLine: 9,
      gapBetweenPoster: 0.5,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getVerticalGeometricDimensionUnder_1400(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 12.7 * this.rationVerticalPoster,
      widthPoster: 12.7,
      nbPosterPerLine: 7,
      gapBetweenPoster: 0.6,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getVerticalGeometricDimensionUnder_1100(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 14.5 * this.rationVerticalPoster,
      widthPoster: 14.5,
      nbPosterPerLine: 6,
      gapBetweenPoster: 0.7,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getVerticalGeometricDimensionUnder_700(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 21.5 * this.rationVerticalPoster,
      widthPoster: 21.5,
      nbPosterPerLine: 4,
      gapBetweenPoster: 0.9,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }

  ///////////DIMENSION GEOMETRIC DES POSTERS SPECIAUX;
  private getInitialSpecialGeometricDimension(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 19 * this.ratioSpecialPoster,
      widthPoster: 19,
      nbPosterPerLine: 5,
      gapBetweenPoster: 0.4,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getSpecialGeometricDimensionUnder_1400(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 23.5 * this.ratioSpecialPoster,
      widthPoster: 23.5,
      nbPosterPerLine: 4,
      gapBetweenPoster: 0.6,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getSpecialGeometricDimensionUnder_1100(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 30.6 * this.ratioSpecialPoster,
      widthPoster: 30.6,
      nbPosterPerLine: 3,
      gapBetweenPoster: 0.75,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getSpecialGeometricDimensionUnder_700(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 45 * this.ratioSpecialPoster,
      widthPoster: 45,
      nbPosterPerLine: 2,
      gapBetweenPoster: 1,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }

  /////////////DIMENSION GEOMETRIC DES POSTERS DE LICENSE;
  private getInitialLicenseGeometricDimension(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 15.5 * this.ratioLicensePoster,
      widthPoster: 15.5,
      nbPosterPerLine: 6,
      gapBetweenPoster: 0.6,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getLicenseGeometricDimensionUnder_1400(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 18.5 * this.ratioLicensePoster,
      widthPoster: 18.5,
      nbPosterPerLine: 5,
      gapBetweenPoster: 0.75,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getLicenseGeometricDimensionUnder_1100(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 22.5 * this.ratioLicensePoster,
      widthPoster: 22.5,
      nbPosterPerLine: 4,
      gapBetweenPoster: 0.85,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getLicenseGeometricDimensionUnder_700(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 30 * this.ratioLicensePoster,
      widthPoster: 30,
      nbPosterPerLine: 3,
      gapBetweenPoster: 1,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }

  /////////////DIMENSION GEOMETRIC DES POSTERS HORIZONTAUX;
  private getInitialHorizontalGeometricDimension(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 15.2 * this.ratioHorizontalePoster,
      widthPoster: 15.2,
      nbPosterPerLine: 6,
      gapBetweenPoster: 0.5,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getHorizontalGeometricDimensionUnder_1400(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 18.2 * this.ratioHorizontalePoster,
      widthPoster: 18.2,
      nbPosterPerLine: 5,
      gapBetweenPoster: 0.6,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getHorizontalGeometricDimensionUnder_1100(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 22.2 * this.ratioHorizontalePoster,
      widthPoster: 22.2,
      nbPosterPerLine: 4,
      gapBetweenPoster: 0.7,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }
  private getHorizontalGeometricDimensionUnder_700(): GeometricDimensionSelectionModel {
    const dimension: GeometricDimensionSelectionModel = {
      heightPoster: 30 * this.ratioHorizontalePoster,
      widthPoster: 30.2,
      nbPosterPerLine: 3,
      gapBetweenPoster: 0.9,
      marginLeft: 0
    }
    dimension.marginLeft = this.setMarginLeft(dimension.widthPoster, dimension.gapBetweenPoster, dimension.nbPosterPerLine);
    return dimension;
  }


  public getVerticalGeometricDimensionSelection(): Observable<GeometricDimensionSelectionModel> {
    return this.verticalGeometricDimension$;
  }
  public getSpecialGeometricDimensionSelection(): Observable<GeometricDimensionSelectionModel> {
    return this.specialGeometricDimension$;
  }
  public getLicenseGeometricDimensionSelection(): Observable<GeometricDimensionSelectionModel> {
    return this.licenseGeometricDimension$;
  }
  public getHorizontalGeometricDimensionSelection(): Observable<GeometricDimensionSelectionModel> {
    return this.horizontalGeometricDimension$;
  }

  public setPaginationSelection(nbPagination: number): PaginationModel[] {
    let pagination: PaginationModel[] = []
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

  public getIndexPagination(pagination: PaginationModel[]): number {
    return pagination.findIndex(page => page.isDisplayed === true);
  }


  private listenToResize(): void {
    fromEvent(window, 'resize')
      .subscribe(() => {
        this.onResize();
      });
  }

  private onResize(): void {
    const width: number = window.innerWidth;
    if (width > 1400) { //> 1400;
      this.updateVerticalDimension(this.getInitialVerticalGeometricDimension());
      this.updateSpecialDimension(this.getInitialSpecialGeometricDimension());
      this.updateLicenseDimension(this.getInitialLicenseGeometricDimension());
      this.updateHorizontalDimension(this.getInitialHorizontalGeometricDimension());
    } else if (width > 1100) { //entre 1100px et 1400px;
      this.updateVerticalDimension(this.getVerticalGeometricDimensionUnder_1400());
      this.updateSpecialDimension(this.getSpecialGeometricDimensionUnder_1400());
      this.updateLicenseDimension(this.getLicenseGeometricDimensionUnder_1400());
      this.updateHorizontalDimension(this.getHorizontalGeometricDimensionUnder_1400());
    } else if (width > 700) { //entre 700px et 1100px;
      this.updateVerticalDimension(this.getVerticalGeometricDimensionUnder_1100())
      this.updateSpecialDimension(this.getSpecialGeometricDimensionUnder_1100());
      this.updateLicenseDimension(this.getLicenseGeometricDimensionUnder_1100());
      this.updateHorizontalDimension(this.getHorizontalGeometricDimensionUnder_1100());
    } else if (width > 500) { //entre 500px et 700px;
      this.updateVerticalDimension(this.getVerticalGeometricDimensionUnder_700())
      this.updateSpecialDimension(this.getSpecialGeometricDimensionUnder_700());
      this.updateLicenseDimension(this.getLicenseGeometricDimensionUnder_700());
      this.updateHorizontalDimension(this.getHorizontalGeometricDimensionUnder_700());
    }
  }

  private setMarginLeft(widthPoster: number, gapBetweenPoster: number, nbPoster: number): number {
    const withSelection: number = gapBetweenPoster * (nbPoster - 1) + widthPoster * nbPoster;
    return (this.pxTovw(document.documentElement.clientWidth) - withSelection) / 2;
  }

  private pxTovw(px: number): number {
    return (100 * px) / window.innerWidth;
  }

  private updateVerticalDimension(newUpdate: GeometricDimensionSelectionModel): void {
    if (newUpdate.heightPoster != this.verticalGeometricDimensionSubject.value.heightPoster) {
      this.verticalGeometricDimensionSubject.next(newUpdate);
    }
  }

  private updateSpecialDimension(newUpdate: GeometricDimensionSelectionModel): void {
    if (newUpdate.heightPoster != this.specialGeometricDimensionSubject.value.heightPoster) {
      this.specialGeometricDimensionSubject.next(newUpdate);
    }
  }

  private updateLicenseDimension(newUpdate: GeometricDimensionSelectionModel): void {
    if (newUpdate.heightPoster != this.licenseGeometricDimensionSubject.value.heightPoster) {
      this.licenseGeometricDimensionSubject.next(newUpdate);
    }
  }

  private updateHorizontalDimension(newUpdate: GeometricDimensionSelectionModel): void {
    if (newUpdate.heightPoster != this.horizontalGeometricDimensionSubject.value.heightPoster) {
      this.horizontalGeometricDimensionSubject.next(newUpdate);
    }
  }

  public getRealHeighVerticalVerticalPoster(): number {
    return this.verticalGeometricDimensionSubject.value.heightPoster * 0.83;
  }
  public getMarginBottomForVerticalPoster(): number {
    return this.verticalGeometricDimensionSubject.value.heightPoster * 0.17;
  }

  public getRealHeighHorizontalPoster(): number {
    return this.horizontalGeometricDimensionSubject.value.heightPoster * 0.75;
  }
  public getMarginBottomForHorizontalPoster(): number {
    return this.horizontalGeometricDimensionSubject.value.heightPoster * 0.25;
  }

  public getDifferenceMarginBottomBetweenVerticalAndHorizontal(): number {
    return this.getMarginBottomForVerticalPoster() - this.horizontalGeometricDimensionSubject.value.heightPoster * 0.25;
  }

  public getMarginBottomPageToVerticalFormat(): number {
    return this.verticalGeometricDimensionSubject.value.heightPoster * 0.6;
  }
  public getMarginBottomPageToHorizontalFormat(): number {
    return this.horizontalGeometricDimensionSubject.value.heightPoster * 0.5;
  }

}

