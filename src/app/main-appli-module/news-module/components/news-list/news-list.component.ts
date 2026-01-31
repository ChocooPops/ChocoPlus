import { Component, Input, SimpleChanges } from '@angular/core';
import { NewsModel } from '../../models/news.interface';
import { NewsComponent } from '../news/news.component';
import { NewsLoadingComponent } from '../news-loading/news-loading.component';
import { PaginationLicenseService } from '../../../license-module/service/pagination-license/pagination-license.service';
import { Subscription } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { PaginationNewsService } from '../../services/pagination-news/pagination-news.service';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { ScrollButtonComponent } from '../../../media-module/components/selections/scroll-button/scroll-button.component';
import { NgClass } from '@angular/common';
import { PaginationModel } from '../../../media-module/models/pagination.interface';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [NewsComponent, NewsLoadingComponent, ScrollButtonComponent, NgClass],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent {

  @Input() newsList: NewsModel[] | undefined = undefined;
  newsShowed !: NewsModel[];
  aspectRatio !: string;

  marginLeft !: number;
  gap!: number;

  offsetX: number = 0;
  dimension!: DimensionModel;
  paginations !: PaginationModel[];
  nbPagination!: number;

  displayScrollLeft!: boolean;
  displayScrollRight!: boolean;
  activateTransition: boolean = true;

  nbPosterPerLine!: number;
  marginLeftAfterScrolling !: number;
  initialMarginLeft !: number;
  leftPagination !: string;

  private subscription: Subscription = new Subscription();

  constructor(private paginationLicenseService: PaginationLicenseService,
    private paginationNewsService: PaginationNewsService
  ) { }

  ngOnInit(): void {
    this.setAspectRatio();
    this.subscription.add(
      this.paginationLicenseService.getHomeLicenseGeometricDimension().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.fillGeometricDimension(dimension);
      })
    );

    this.subscription.add(
      this.paginationNewsService.getDimensionNews().subscribe((ratio: DimensionModel) => {
        this.dimension = ratio;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newsList']) {
      this.setNewsShowed();
      this.setNbPage();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setNewsShowed(): void {
    if (this.newsList) {
      if (this.newsList.length > this.nbPosterPerLine) {
        if (!this.newsShowed) {
          const left = [this.newsList[this.newsList.length - 1]];
          const centerAndRight = this.newsList.slice(0, this.nbPosterPerLine + 1);
          this.newsShowed = [...left, ...centerAndRight];
          this.setNbPage();
        }
        this.activateTransition = false;
        this.offsetX = 0;
        this.marginLeft = -this.marginLeftAfterScrolling - this.gap;
        this.displayScrollLeft = true;
        this.displayScrollRight = true;
      } else {
        this.newsShowed = this.newsList;
      }
    }
  }

  private fillGeometricDimension(dimension: GeometricDimensionSelectionModel): void {
    this.nbPosterPerLine = 1;
    this.initialMarginLeft = dimension.marginLeft;
    this.gap = dimension.gapBetweenPoster;
    this.marginLeft = dimension.marginLeft;
    const newDimension: DimensionModel = this.paginationNewsService.setDimension(dimension.marginLeft);
    this.marginLeftAfterScrolling = newDimension.width - this.marginLeft;
    this.leftPagination = `calc(${this.marginLeft}vw + 10px)`;

    this.setNewsShowed();
  }

  private setNbPage(): void {
    if (this.newsList) {
      this.nbPagination = Math.ceil(this.newsList.length / this.nbPosterPerLine)
      this.paginations = this.paginationLicenseService.setPaginationSelection(this.nbPagination);
    }
  }

  private setAspectRatio(): void {
    const ratio: DimensionModel = this.paginationNewsService.getAspectRatio();
    this.aspectRatio = `${ratio.width}/${ratio.height}`;
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

  private removeMovieNotDisplayed(direction: boolean): void {
    if (direction) { //right
      this.newsShowed.splice(0, this.newsShowed.length - (this.nbPosterPerLine + 2));
    } else { //left
      this.newsShowed.length = this.nbPosterPerLine + 2;
    }
    this.activateTransition = false;
    this.offsetX = 0;
    this.marginLeft = -this.marginLeftAfterScrolling - this.gap;
  }

  public clickRight(): void {
    if (this.activateScrolling && this.newsList) {
      const maxIndex: number = this.newsList.findIndex((news: NewsModel) => news.id === this.newsShowed[this.newsShowed.length - 1].id)
      this.newsShowed.push(...this.getNextValues(maxIndex, this.nbPosterPerLine));
      this.onClickButtonLeftOrRight(true);
      this.paginationNewsService.nextPagination(this.paginations);
    }
  }

  public clickLeft(): void {
    if (this.activateScrolling && this.newsList) {
      const maxIndex: number = this.newsList.findIndex((licence: NewsModel) => licence.id === this.newsShowed[0].id)
      this.newsShowed.unshift(...this.getPreviousValues(maxIndex, this.nbPosterPerLine));

      this.activateTransition = false;
      const innerWidth: number = this.getClientWidth();
      const marginLefPx: number = this.vwToPx(this.initialMarginLeft);
      const gapPx: number = this.vwToPx(this.gap);
      this.offsetX = (-innerWidth + (marginLefPx * 2) - gapPx) * 1;
      this.paginationNewsService.beforePagination(this.paginations);

      setTimeout(() => {
        this.onClickButtonLeftOrRight(false)
      }, 10)
    }
  }

  private getNextValues(startIndex: number, count: number): NewsModel[] {
    if (this.newsList) {
      const result: NewsModel[] = [];
      const listLength: number = this.newsList.length;
      for (let i = 1; i <= count; i++) {
        const index = (startIndex + i) % listLength;
        result.push(this.newsList[index]);
      }
      return result;
    } else {
      return [];
    }
  }

  private getPreviousValues(startIndex: number, count: number): NewsModel[] {
    if (this.newsList) {
      const result: NewsModel[] = [];
      const listLength: number = this.newsList.length;
      for (let i = 1; i <= count; i++) {
        const index = (startIndex - i + listLength) % listLength;
        result.push(this.newsList[index]);
      }
      return result.reverse();
    } else {
      return [];
    }
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

  private getClientWidth(): number {
    return document.documentElement.clientWidth;
  }

  private vwToPx(vw: number): number {
    const width = window.innerWidth;
    return (vw / 100) * width;
  }

}
