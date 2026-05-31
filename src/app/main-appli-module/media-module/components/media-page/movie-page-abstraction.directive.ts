import { Directive, Input, SimpleChanges } from '@angular/core';
import { MovieModel } from '../../models/movie-model';
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

@Directive({})
export abstract class MoviePageAbstraction {

  @Input() movie!: MovieModel;
  protected abstract formatMediaPage: FormatMediaPageModel;
  protected abortControllerSimilarMedias = new AbortController();
  protected abortControllerInfoMovie = new AbortController();
  protected subscriptionSimilarTitles!: Subscription;
  protected subscriptionMovieInfo!: Subscription;

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
    protected readonly router: Router
  ) { }

  ngOnInit(): void {
    this.initSimilarLoading();
  }

  ngOnDestroy(): void {
    this.setUnsubscriptionMovieInfo();
    this.setUnsubscriptionSimilarTitles();
  }

  private setUnsubscriptionMovieInfo(): void {
    if (this.subscriptionMovieInfo) {
      this.subscriptionMovieInfo.unsubscribe();
    }
    this.abortControllerInfoMovie.abort();
  }

  private setUnsubscriptionSimilarTitles(): void {
    if (this.subscriptionSimilarTitles) {
      this.subscriptionSimilarTitles.unsubscribe();
    }
    this.abortControllerSimilarMedias.abort();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie']) {
      this.resetInfo();
      this.init();
    }
  }

  private initSimilarLoading(): void {
    for (let i = 0; i < 9; i++) {
      this.similarMediasLoading.push(i);
    }
  }

  private resetInfo(): void {
    this.resetInfoSpe();
    this.crews = undefined;
    this.casts = undefined;
    this.genres = [];
    this.keyWords = [];
    this.description = '';
    this.similarMedias = undefined;
  }

  private init(): void {
    this.initSpe();
    this.mediaInfoLoaded = false;
    this.description = this.movie?.description || '';

    setTimeout(() => {
      this.fetchSimilarMovie();
      this.fetchMediaInfo();
    }, 100);
  }

  protected fetchSimilarMovie(): void {
    if (this.movie) {
      this.setUnsubscriptionSimilarTitles();
      this.subscriptionSimilarTitles = this.similarTitleService
        .fetchSimilarTitlesForOneMovieById(this.movie.id)
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
  }

  protected fetchMediaInfo(): void {
    if (this.movie) {
      this.setUnsubscriptionMovieInfo();
      this.subscriptionMovieInfo = this.mediaSelectedService
        .fetchGetMediaInfoById(this.movie.id)
        .pipe(take(1))
        .subscribe((info: MediaInfoModel | null) => {
          if (info) {
            this.genres = info.categories;
            this.keyWords = info.keyWords;
            
            if (this.formatMediaPage === FormatMediaPageModel.HORIZONTAL) {
              const img = this.imagePreloaderService.getPosterFromCredits([...info.casts, ...info.crews]);
              this.imagePreloaderService
                .preloadImages(img, this.abortControllerInfoMovie.signal)
                .finally(() => {
                  this.casts = info.casts;
                  this.crews = info.crews;
              });
            } else {
              this.casts = info.casts;
              this.crews = info.crews;
            }
          } else {
            this.casts = [];
            this.crews = [];
          }
          this.mediaInfoLoaded = true;
        });
    }
  }

  onClickSimilarTitle(media: MediaModel): void {
    this.mediaSelectedService.selectMedia(media);
  }

  protected abstract resetInfoSpe(): void;
  protected abstract initSpe(): void;
  
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
          logic: index < jobs.length ? LogicalOperator.OR : LogicalOperator.AND,
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
    this.filtersCatalogService.setFilterFromMediaPage(filtres);
    this.mediaSelectedService.clearSelection();
    this.router.navigateByUrl('main-app/catalog');
  }

}
