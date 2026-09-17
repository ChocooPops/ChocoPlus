import { Directive, Input, SimpleChanges } from '@angular/core';
import { MovieModel } from '../../models/movie-model';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { SimilarTitleService } from '../../services/similar-title/similar-title.service';
import { MediaSelectedService } from '../../services/media-selected/media-selected.service';
import { FiltersCatalogService } from '../../services/filters-catalog/filters-catalog.service';
import { Router } from '@angular/router';
import { MovieSeriesPageAbstraction } from './movie-series-page-abstraction.directive';
import { DownloadService } from '../../services/download/download.service';

@Directive({})
export abstract class MoviePageAbstraction extends MovieSeriesPageAbstraction {

  @Input() movie!: MovieModel;

  constructor(
    imagePreloaderService: ImagePreloaderService,
    similarTitleService: SimilarTitleService,
    mediaSelectedService: MediaSelectedService,
    filtersCatalogService: FiltersCatalogService,
    downloadService: DownloadService,
    router: Router
  ) {
    super(imagePreloaderService, similarTitleService, mediaSelectedService, filtersCatalogService, downloadService, router);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie']) {
      this.resetInfo();
      this.init();
    }
  }

  protected getMediaId(): number {
    return this.movie?.id;
  }

  private init(): void {
    this.initSpe();
    this.mediaInfoLoaded = false;
    this.description = this.movie?.description || '';

    if (this.isOnLine) {
      this.fetchSimilarMedia();
      this.fetchMediaInfo();
    } else {
      this.fetchMediaInfoOffLine();
    }

  }

}
