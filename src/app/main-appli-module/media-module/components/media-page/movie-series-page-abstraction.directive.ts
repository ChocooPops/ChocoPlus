import { Directive } from '@angular/core';
import { MediaModel } from '../../models/media.interface';
import { Subscription, take } from 'rxjs';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { SimilarTitleService } from '../../services/similar-title/similar-title.service';
import { MediaSelectedService } from '../../services/media-selected/media-selected.service';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { MediaInfoModel } from '../../models/media-info.interface';
import { JobModel } from '../../models/job.eum';
import { FormatMediaPageModel } from '../../models/format-media-page-enum';
import { CategorySimpleModel } from '../../../edition-module/models/category/categorySimple.model';
import { FiltersCatalogService } from '../../services/filters-catalog/filters-catalog.service';
import { FILTERS } from '../../models/catalog/filters.interface';
import { Router } from '@angular/router';
import { FilterType } from '../../models/catalog/filter-type.enum';
import { Operation } from '../../models/catalog/operation.enum';
import { MediaCreditModel } from '../../models/media-credit.interface';
import { LogicalOperator } from '../../models/catalog/logical-operator';
import { DownloadService } from '../../services/download/download.service';

@Directive({})
export abstract class MovieSeriesPageAbstraction {

  protected isOnLine!: boolean;
  protected abstract formatMediaPage: FormatMediaPageModel;

  protected abortControllerSimilarMedias = new AbortController();
  protected abortControllerInfoMedia = new AbortController();
  protected subscriptionSimilarTitles!: Subscription;
  protected subscriptionMediaInfo!: Subscription;

  genres: CategorySimpleModel[] = [];
  keyWords: string[] = [];
  description!: string;
  mediaInfoLoaded: boolean = false;

  crews: MediaCreditModel[] | undefined = undefined;
  casts: MediaCreditModel[] | undefined = undefined;
  similarMedias: MediaModel[] | undefined = undefined;
  similarMediasLoading: number[] = [];

  JobModel = JobModel;

  constructor(
    protected readonly imagePreloaderService: ImagePreloaderService,
    protected readonly similarTitleService: SimilarTitleService,
    protected readonly mediaSelectedService: MediaSelectedService,
    protected readonly filtersCatalogService: FiltersCatalogService,
    protected readonly downloadService: DownloadService,
    protected readonly router: Router
  ) {
    this.isOnLine = this.mediaSelectedService.getIsOnLine();
  }

  ngOnInit(): void {
    this.initSimilarLoading();
  }

  ngOnDestroy(): void {
    this.setUnsubscriptionMediaInfo();
    this.setUnsubscriptionSimilarTitles();
  }

  protected setUnsubscriptionMediaInfo(): void {
    if (this.subscriptionMediaInfo) {
      this.subscriptionMediaInfo.unsubscribe();
    }
    this.abortControllerInfoMedia.abort();
  }

  protected setUnsubscriptionSimilarTitles(): void {
    if (this.subscriptionSimilarTitles) {
      this.subscriptionSimilarTitles.unsubscribe();
    }
    this.abortControllerSimilarMedias.abort();
  }

  protected initSimilarLoading(): void {
    for (let i = 0; i < 9; i++) {
      this.similarMediasLoading.push(i);
    }
  }

  protected resetInfo(): void {
    this.resetInfoSpe();
    this.crews = undefined;
    this.casts = undefined;
    this.genres = [];
    this.keyWords = [];
    this.description = '';
    this.similarMedias = undefined;
    this.resetInfoExtra();
  }

  protected resetInfoExtra(): void { }

  protected beforeFetchSimilarMedia(): void { }

  protected transformKeyWord(keyWord: string): string {
    return keyWord;
  }

  protected abstract getMediaId(): number;
  protected abstract resetInfoSpe(): void;
  protected abstract initSpe(): void;

  protected fetchSimilarMedia(): void {
    if (!this.isOnLine) return;
    if (!this.getMediaId()) return;
    this.beforeFetchSimilarMedia();
    this.setUnsubscriptionSimilarTitles();
    this.subscriptionSimilarTitles = this.similarTitleService
      .fetchSimilarTitlesForOneMovieById(this.getMediaId())
      .pipe(take(1))
      .subscribe((data: MediaModel[]) => {
        let img: string[] = [];
        if (this.formatMediaPage === FormatMediaPageModel.VERTICAL) {
          img = this.imagePreloaderService.getPosterFromMediaListToLoad(
            data,
            FormatPosterModel.HORIZONTAL,
          );
        } else if (this.formatMediaPage === FormatMediaPageModel.HORIZONTAL) {
          img = this.imagePreloaderService.getPosterFromMediaListToLoad(
            data,
            FormatPosterModel.VERTICAL,
          );
        }
        this.imagePreloaderService
          .preloadImages(img, this.abortControllerSimilarMedias.signal)
          .finally(() => {
            this.similarMedias = data;
          });
      });
  }

  protected fetchMediaInfo(): void {
    if (!this.isOnLine || !this.getMediaId()) return;
    this.setUnsubscriptionMediaInfo();
    this.subscriptionMediaInfo = this.mediaSelectedService
      .fetchGetMediaInfoById(this.getMediaId())
      .pipe(take(1))
      .subscribe((info) => this.processMediaInfo(info));
  }

  protected fetchMediaInfoOffLine(): void {
    if (this.isOnLine || !this.getMediaId()) return;
    this.subscriptionMediaInfo = this.downloadService
      .readMediaInfoById(this.getMediaId())
      .pipe(take(1))
      .subscribe((info) => this.processMediaInfo(info));
  }

  private processMediaInfo(info: MediaInfoModel | null): void {
    if (info) {
      this.genres = info.categories;
      this.keyWords = info.keyWords.map((item) => this.transformKeyWord(item));

      if (this.formatMediaPage === FormatMediaPageModel.HORIZONTAL) {
        const img = this.imagePreloaderService.getPosterFromCredits([
          ...info.casts,
          ...info.crews,
        ]);
        this.imagePreloaderService
          .preloadImages(img, this.abortControllerInfoMedia.signal)
          .finally(() => this.setCastsAndCrews(info));
      } else {
        this.setCastsAndCrews(info);
      }
    } else {
      this.casts = [];
      this.crews = [];
    }
    this.mediaInfoLoaded = true;
  }

  private setCastsAndCrews(info: MediaInfoModel): void {
    this.casts = info.casts;
    this.crews = info.crews;
  }

  onClickSimilarTitle(media: MediaModel): void {
    this.mediaSelectedService.selectMedia(media);
  }

  protected setFilterCategory(category: CategorySimpleModel): void {
    const filters: FILTERS[] = [
      {
        id: -2,
        typeData: FilterType.CATEGORY,
        operation: Operation.CONTAIN,
        value: [
          {
            name: category.translationKey,
            value: category.id
          }
        ]
      }
    ];
    this.setFilterCatalogAndNavigate(filters);
  }

  protected setFilterCredit(credit: MediaCreditModel): void {
    const filters: FILTERS[] = [];
    let id: number = -2;
    const jobs: JobModel[] = credit.job.split('\\').map((item) => item.trim()) as any;
    jobs.forEach((job: JobModel, index: number) => {
      filters.push({
          id: id--,
          typeData: job,
          operation: Operation.CONTAIN,
          logic: index === 0 ? LogicalOperator.AND : LogicalOperator.OR,
          value: [
            {
              name: credit.fullName,
              value: credit.id
            }
          ]
        }
      )
    });
    this.setFilterCatalogAndNavigate(filters);
  }

  protected setFilterKeyWord(keyword: string): void {
    const filters: FILTERS[] = [
      {
        id: -2,
        typeData: FilterType.KEY_WORD,
        operation: Operation.CONTAIN,
        value: [
          {
            name: keyword,
            value: keyword
          }
        ]
      }
    ];
    this.setFilterCatalogAndNavigate(filters);
  }

  protected setFilterCatalogAndNavigate(filtres: FILTERS[]): void {
    if (!this.isOnLine) return;
    this.filtersCatalogService.setFilterFromMediaPage(filtres);
    this.mediaSelectedService.clearSelection();
    this.router.navigateByUrl('main-app/catalog');
  }

}
