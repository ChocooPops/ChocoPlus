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
import { CreditModel } from '../../models/credit.interface';

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

  crews: CreditModel[] | undefined = undefined;
  casts: CreditModel[] | undefined = undefined;
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
            this.keyWords = info.keyWords.map((item) => this.transform(item));
            
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

  private transform(value: string): string {
    if (!value) return '';
    value = value.trimStart();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  onClickSimilarTitle(media: MediaModel): void {
    this.mediaSelectedService.selectMedia(media);
  }

  protected abstract resetInfoSpe(): void;
  protected abstract initSpe(): void;
  
  protected setFilterCategory(category: CategorySimpleModel): void {
    const filter: FILTERS = {
      id: -2,
      title: '',
      typeData: FilterType.CATEGORY,
      operation: Operation.CONTAIN,
      value: [
        {
          name: category.name,
          value: category.id
        }
      ]
    }
    this.setFilterCatalogAndNavigate(filter);
  }
  protected setFilterCredit(credit: CreditModel): void {
    const filter: FILTERS = {
      id: -2,
      title: '',
      typeData: credit.job,
      operation: Operation.CONTAIN,
      value: [
        {
          name: credit.fullName,
          value: credit.id
        }
      ]
    }
    this.setFilterCatalogAndNavigate(filter);
  }
  protected setFilterKeyWord(keyword: string): void {
    const filter: FILTERS = {
      id: -2,
      title: '',
      typeData: FilterType.KEY_WORD,
      operation: Operation.CONTAIN,
      value: [
        {
          name: keyword,
          value: keyword
        }
      ]
    }
    this.setFilterCatalogAndNavigate(filter);
  }

  protected setFilterCatalogAndNavigate(filtre: FILTERS): void {
    this.filtersCatalogService.setFilterFromMediaPage(filtre);
    this.router.navigateByUrl('main-app/catalog');
  }

}
