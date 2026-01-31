import { Component } from '@angular/core';
import { HomeLicenseComponent } from '../home-license/home-license.component';
import { LicenseModel } from '../../model/license.interface';
import { Subscription, take } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { PosterLoadingComponent } from '../../../media-module/components/posters/poster-loading/poster-loading.component';
import { PaginationModel } from '../../../media-module/models/pagination.interface';
import { ScrollButtonComponent } from '../../../media-module/components/selections/scroll-button/scroll-button.component';
import { NgClass } from '@angular/common';
import { PaginationComponent } from '../../../media-module/components/selections/pagination/pagination.component';
import { LicenseService } from '../../service/license/licence.service';
import { PaginationLicenseService } from '../../service/pagination-license/pagination-license.service';

@Component({
  selector: 'app-home-license-list',
  standalone: true,
  imports: [HomeLicenseComponent, PaginationComponent, NgClass, PosterLoadingComponent, ScrollButtonComponent],
  templateUrl: './home-license-list.component.html',
  styleUrl: './home-license-list.component.css'
})

export class HomeLicenseListComponent {

  private abortController = new AbortController();
  licenceHomeList: LicenseModel[] | undefined = undefined;
  licenseLoadingList: number[] = [];

  licenseShowed !: LicenseModel[];
  pagination !: PaginationModel[];
  offsetX: number = 0;
  nbPagination !: number;
  nbPosterPerLine !: number;
  displayScrollLeft!: boolean;
  displayScrollRight!: boolean;
  activateTransition: boolean = true;

  width !: number;
  height !: number;
  gap !: number;
  marginLeft !: number;
  initialMarginLeft !: number;
  marginLeftAfterScrolling !: number;
  marginLeftTitle !: number;

  private subscription: Subscription = new Subscription();

  constructor(private licenseService: LicenseService,
    private paginationLicenseService: PaginationLicenseService,
    private imagePreloaderService: ImagePreloaderService
  ) { }

  ngOnInit(): void {
    this.fillLicenseLoading();
    this.subscription.add(
      this.licenseService.fetchAllLicenseHome().pipe(take(1)).subscribe((data: LicenseModel[]) => {
        const img: string[] = this.imagePreloaderService.getAllIconsFromLicense(data);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          this.licenceHomeList = data;
          this.setNbPage();
          this.setLicenseShowed();
        })
      })
    )
    this.subscription.add(
      this.paginationLicenseService.getHomeLicenseGeometricDimension().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.fillGeometricDimension(dimension);
      })
    )
  }

  private fillLicenseLoading(): void {
    for (let i = 0; i < 6; i++) {
      this.licenseLoadingList.push(i);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

  private fillGeometricDimension(dimension: GeometricDimensionSelectionModel): void {
    this.nbPosterPerLine = dimension.nbPosterPerLine;
    this.gap = dimension.gapBetweenPoster;
    this.marginLeft = dimension.marginLeft;
    this.initialMarginLeft = dimension.marginLeft;
    this.marginLeftAfterScrolling = dimension.widthPoster - this.marginLeft;
    this.width = dimension.widthPoster;
    this.height = dimension.heightPoster;
    this.setNbPage();
    this.setLicenseShowed();
  }

  private setLicenseShowed(): void {
    if (this.licenceHomeList) {
      if (this.licenceHomeList.length > this.nbPosterPerLine) {
        const left = [this.licenceHomeList[this.licenceHomeList.length - 1]];
        const centerAndRight = this.licenceHomeList.slice(0, this.nbPosterPerLine + 1);
        this.licenseShowed = [...left, ...centerAndRight];
        this.activateTransition = false;
        this.offsetX = 0;
        this.marginLeft = -this.marginLeftAfterScrolling - this.gap;
        this.displayScrollLeft = true;
        this.displayScrollRight = true;
      } else {
        this.licenseShowed = this.licenceHomeList.slice(0, this.nbPosterPerLine + 1);
      }
    }
  }

  private setNbPage(): void {
    if (this.licenceHomeList) {
      this.nbPagination = Math.ceil(this.licenceHomeList.length / this.nbPosterPerLine)
      this.pagination = this.paginationLicenseService.setPaginationSelection(this.nbPagination);
      if (this.nbPagination > 1) {
        this.displayScrollRight = true;
      }
    }
  }

  private getClientWidth(): number {
    return document.documentElement.clientWidth;
  }

  private vwToPx(vw: number): number {
    const width = window.innerWidth;
    return (vw / 100) * width;
  }

  timerDuringScrolling: any | null;
  activateScrolling: boolean = true;

  private startTimerDuringScrolling(direction: boolean): void {
    this.timerDuringScrolling = setTimeout(() => {
      this.activateScrolling = true;
      clearTimeout(this.timerDuringScrolling);
      this.timerDuringScrolling = null;
      this.removeMovieNotDisplayed(direction);
      if (!this.displayScrollLeft) {
        this.displayScrollLeft = true;
      }
    }, 1100)
  }

  public clickRight(): void {
    if (this.activateScrolling && this.licenceHomeList) {
      const maxIndex: number = this.licenceHomeList.findIndex((licence: LicenseModel) => licence.id === this.licenseShowed[this.licenseShowed.length - 1].id)
      this.licenseShowed.push(...this.getNextValues(maxIndex, this.nbPosterPerLine));
      this.onClickButtonLeftOrRight(true);
      this.paginationLicenseService.nextPagination(this.pagination);
    }
  }

  public clickLeft(): void {
    if (this.activateScrolling && this.licenceHomeList) {
      const maxIndex: number = this.licenceHomeList.findIndex((licence: LicenseModel) => licence.id === this.licenseShowed[0].id)
      this.licenseShowed.unshift(...this.getPreviousValues(maxIndex, this.nbPosterPerLine));

      this.activateTransition = false;
      const innerWidth: number = this.getClientWidth();
      const marginLefPx: number = this.vwToPx(this.initialMarginLeft);
      const gapPx: number = this.vwToPx(this.gap);
      this.offsetX = (-innerWidth + (marginLefPx * 2) - gapPx) * 1;
      this.paginationLicenseService.beforePagination(this.pagination);

      setTimeout(() => {
        this.onClickButtonLeftOrRight(false)
      }, 10)
    }
  }

  private getNextValues(startIndex: number, count: number): LicenseModel[] {
    if (this.licenceHomeList) {
      const result: LicenseModel[] = [];
      const listLength: number = this.licenceHomeList.length;
      for (let i = 1; i <= count; i++) {
        const index = (startIndex + i) % listLength;
        result.push(this.licenceHomeList[index]);
      }
      return result;
    } else {
      return [];
    }
  }

  private getPreviousValues(startIndex: number, count: number): LicenseModel[] {
    if (this.licenceHomeList) {
      const result: LicenseModel[] = [];
      const listLength: number = this.licenceHomeList.length;
      for (let i = 1; i <= count; i++) {
        const index = (startIndex - i + listLength) % listLength;
        result.push(this.licenceHomeList[index]);
      }
      return result.reverse();
    } else {
      return [];
    }
  }

  private removeMovieNotDisplayed(direction: boolean): void {
    if (direction) { //right
      this.licenseShowed.splice(0, this.licenseShowed.length - (this.nbPosterPerLine + 2));
    } else { //left
      this.licenseShowed.length = this.nbPosterPerLine + 2;
    }
    this.activateTransition = false;
    this.offsetX = 0;
    this.marginLeft = -this.marginLeftAfterScrolling - this.gap;
  }

  private onClickButtonLeftOrRight(direction: boolean): void {
    this.activateScrolling = false;
    this.activateTransition = true;
    const innerWidth: number = this.getClientWidth();
    const marginLefPx: number = this.vwToPx(this.initialMarginLeft);
    const gapPx: number = this.vwToPx(this.gap);
    if (direction) {
      this.offsetX = (-innerWidth + (marginLefPx * 2) - gapPx);
    } else {
      this.offsetX = 0;
    }
    this.startTimerDuringScrolling(direction);
  }

}
