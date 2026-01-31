import { Component, Input, SimpleChanges } from '@angular/core';
import { SeriesModel } from '../../../models/series/series.interface';
import { NgClass } from '@angular/common';
import { SeasonModel } from '../../../models/series/season.interface';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { MediaModel } from '../../../models/media.interface';
import { SimilarPosterComponent } from '../../posters/similar-poster/similar-poster.component';
import { SimilarPosterLoadingComponent } from '../../posters/similar-poster-loading/similar-poster-loading.component';
import { MediaSelectedService } from '../../../services/media-selected/media-selected.service';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { DatePipe } from '@angular/common';
import { Subscription, take } from 'rxjs';
import { SimilarTitleService } from '../../../services/similar-title/similar-title.service';
import { ImagePreloaderService } from '../../../../../common-module/services/image-preloader/image-preloader.service';
import { FormatPosterModel } from '../../../../common-module/models/format-poster.enum';
import { SeriesService } from '../../../services/series/series.service';
import { EpisodePosterComponent } from '../../posters/episode-poster/episode-poster.component';
import { EpisodePosterLoadingComponent } from '../../posters/episode-poster-loading/episode-poster-loading.component';

@Component({
  selector: 'app-series-page',
  standalone: true,
  imports: [NgClass, EpisodePosterLoadingComponent, EpisodePosterComponent, SimilarPosterComponent, SimilarPosterLoadingComponent, DatePipe],
  templateUrl: './series-page.component.html',
  styleUrls: ['./series-page.component.css', '../../../../common-module/styles/animation.css', '../media-page.css']
})
export class SeriesPageComponent {

  @Input() series!: SeriesModel;
  private abortController = new AbortController();

  srcSucces: string = 'icon/success.svg';
  genre: string = '';
  keyWord: string = '';
  actors !: string;
  director !: string;
  description !: string;
  date !: Date | null;
  type: boolean = true;

  similarMedias: MediaModel[] | undefined = undefined;
  similarMediasLoading: number[] = [];

  seasons: { id: number, srcPoster: string | undefined, name: string, isClicked: boolean }[] = [];
  seasonsLoading: number[] = [];
  seasonsPosterTmp: number[] = [];

  episodes: EpisodeModel[] | undefined = [];

  subscriptionEpisodes !: Subscription;
  subscriptionSimilarTitles !: Subscription;

  constructor(private compressedPosterService: CompressedPosterService,
    private mediaSelectedService: MediaSelectedService,
    private similarTitleService: SimilarTitleService,
    private imagePreloaderService: ImagePreloaderService,
    private seriesService: SeriesService
  ) { }

  ngOnInit(): void {
    this.initComponentLoading();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series']) {
      this.resetInfo();
      this.initComponentLoading();
      this.init();
      this.initSeasons();
      if (this.type) {
        this.onClickTypeSeasonsEpisodes();
      } else {
        this.onClickTypeSimilarTitles();
      }
    }
  }

  ngOnDestroy(): void {
    this.setUnsubscribeEpisode();
    this.setUnsubscriptionSimilarTitle();
    this.abortController.abort();
  }

  private resetInfo(): void {
    this.director = '';
    this.actors = '';
    this.genre = '';
    this.keyWord = '';
    this.description = '';
    this.similarMedias = undefined;
    this.date = null;
    this.episodes = [];
    this.seasons = [];
    this.seasonsPosterTmp = [];
  }

  private setUnsubscribeEpisode(): void {
    if (this.subscriptionEpisodes) {
      this.subscriptionEpisodes.unsubscribe();
    }
  }
  private setUnsubscriptionSimilarTitle(): void {
    if (this.subscriptionSimilarTitles) {
      this.subscriptionSimilarTitles.unsubscribe();
    }
  }

  private init(): void {
    this.description = this.series?.description || '';
    this.date = this.series.date || new Date();

    if (this.series.categories) {
      this.genre = this.series.categories.map(item => item.name).join(', ');
    }
    if (this.series.keyWord) {
      this.keyWord = this.series.keyWord.map(item => this.transform(item)).join(', ');
    }
    if (this.series.actors) {
      this.actors = this.series.actors.join(', ');
    }
    if (this.series.directors) {
      this.director = this.series.directors.join(', ');
    }
  }

  private initSeasons(): void {
    this.episodes = undefined;
    this.series.seasons.forEach((season: SeasonModel) => {
      this.seasons.push({
        id: season.id,
        srcPoster: this.compressedPosterService.getSeasonPoster(season),
        name: season.name,
        isClicked: season.isClicked
      });
    });
    const iteration: number = 5 - this.seasons.length;
    for (let i = 0; i < iteration; i++) {
      this.seasonsPosterTmp.push(i);
    }
  }

  private initComponentLoading(): void {
    for (let i = 0; i < 9; i++) {
      this.similarMediasLoading.push(i);
    }
    for (let i = 0; i < 5; i++) {
      this.seasonsLoading.push(i);
    }
  }

  private transform(value: string): string {
    if (!value) return '';
    value = value.trimStart();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  onClickTypeSeasonsEpisodes(): void {
    this.type = true;
    if (this.series.seasons.length > 0) {
      const index = this.series.seasons.findIndex((item: SeasonModel) => item.isClicked === true);
      if (index >= 0) {
        this.fetchEpisodeBySeason(this.series.seasons[index].id, index);
      } else {
        this.series.seasons[0].isClicked = true;
        this.seasons[0].isClicked = true;
        this.fetchEpisodeBySeason(this.series.seasons[0].id, 0);
      }
    }
  }

  onClickTypeSimilarTitles(): void {
    this.type = false;
    this.fetchSimilarMovie();
  }

  onClickSimilarTitle(media: MediaModel): void {
    this.mediaSelectedService.selectMedia(media);
  }

  onClickSeason(index: number): void {
    if (index < 0) return;
    this.series.seasons.forEach((s, i) => {
      s.isClicked = (i === index);
    });
    this.seasons.forEach((s, i) => {
      s.isClicked = (i === index);
    });
    this.fetchEpisodeBySeason(this.series.seasons[index].id, index);
  }

  private fetchEpisodeBySeason(idSeason: number, indexSeason: number): void {
    this.episodes = undefined;
    this.setUnsubscribeEpisode();
    this.setUnsubscriptionSimilarTitle();
    if (this.series.seasons[indexSeason].episodes.length <= 0) {
      this.abortController.abort();
      this.subscriptionEpisodes = this.seriesService.fetchEpisodesBySeriesAndSeasonId(this.series.id, idSeason).pipe(take(1)).subscribe((data: EpisodeModel[]) => {
        const img: string[] = this.imagePreloaderService.getPosterFromEpisodes(data);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          this.series.seasons[indexSeason].episodes = data;
          this.episodes = this.series.seasons[indexSeason].episodes;
        });
      });
    } else {
      this.episodes = this.series.seasons[indexSeason].episodes;
    }
  }

  private fetchSimilarMovie(): void {
    this.episodes = undefined;
    this.setUnsubscribeEpisode();
    this.setUnsubscriptionSimilarTitle();
    this.abortController.abort();
    this.subscriptionSimilarTitles = this.similarTitleService.fetchSimilarTitlesForOneMovieById(this.series.id).pipe(take(1)).subscribe((data: MediaModel[]) => {
      const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(data, FormatPosterModel.HORIZONTAL);
      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.similarMedias = data;
      })
    });
  }

  onErrorPosterSeason(index: number): void {
    this.seasons[index].srcPoster = undefined;
  }

}
