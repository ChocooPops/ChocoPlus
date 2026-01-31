import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { PaginationModel } from '../../../media-module/models/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class PaginationNewsService {

  private aspectRatio: DimensionModel = {
    width: 1700,
    height: 550,
  }
  private dimensionNewsSubject: BehaviorSubject<DimensionModel> = new BehaviorSubject<DimensionModel>(this.aspectRatio);
  private dimensionNews$: Observable<DimensionModel> = this.dimensionNewsSubject.asObservable();

  constructor() {
  }

  public getDimensionNews(): Observable<DimensionModel> {
    return this.dimensionNews$;
  }

  public setDimension(marginLeft: number): DimensionModel {
    const windowsVw: number = this.pxTovw(this.getWidthWindows());
    const width = windowsVw - marginLeft * 2;
    const height = width * (this.aspectRatio.height / this.aspectRatio.width);
    const newDimention: DimensionModel = {
      width: width,
      height: height
    }
    this.dimensionNewsSubject.next(newDimention);
    return newDimention;
  }

  public getAspectRatio(): DimensionModel {
    return this.aspectRatio;
  }

  private pxTovw(px: number): number {
    return (100 * px) / window.innerWidth;
  }

  private getWidthWindows(): number {
    return document.documentElement.clientWidth;
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
