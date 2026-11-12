import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, Subscription, take } from 'rxjs';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { SeasonModel } from '../../../media-module/models/series/season.interface';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { ProgressStateMedia } from '../../../media-module/models/progress-state-media.enum';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { DownloadService } from '../../../media-module/services/download/download.service';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { GlobalFormattingService } from '../../../common-module/services/global-formatting/global-formatting.service';
import { HistoricWatchProgressService } from '../../services/historic-watch-progress/historic-watch-progress.service';
import { PlayerPanel } from '../player-panel/player-panel';

export interface EpisodeSelection {
  episode: EpisodeModel,
  seasonIndex: number
}

interface EpisodeItem {
  episode: EpisodeModel,
  poster: string,
  duration: string,
  // 0 - 100
  progress: number,
  finished: boolean
}

// Episodes of the series, season by season, opened by hovering the button. Online: the server's episodes,
// offline: the downloaded ones. Choosing one is left to the player (selectEpisode). Hover logic: PlayerPanel.
@Component({
  selector: 'app-bt-series',
  standalone: true,
  imports: [BtClassicComponent, NgClass, TranslatePipe],
  templateUrl: './bt-series.component.html',
  // Shared styles first: the component's own rules come after and override them
  styleUrls: ['../../styles/player-panel.css', '../../../common-module/styles/animation.css', './bt-series.component.css']
})
export class BtSeriesComponent extends PlayerPanel implements OnChanges, OnDestroy {

  @Input() series!: SeriesModel;
  // Season of the episode being played
  @Input() seasonIndex: number = 0;
  @Input() currentEpisodeId: number = -1;
  @Input() isConnected: boolean = true;
  @Output() selectEpisode = new EventEmitter<EpisodeSelection>();
  @ViewChild('episodeList') episodeListRef?: ElementRef<HTMLElement>;
  @ViewChild('seasonSelect') seasonSelectRef?: ElementRef<HTMLElement>;

  readonly srcImage: string = 'icon/controls/series.svg';
  readonly srcArrow: string = 'icon/arrow.svg';
  readonly srcCheck: string = 'icon/success.svg';
  readonly srcPlay: string = 'icon/play-icon.svg';
  readonly srcEpisode: string = 'icon/episode.svg';
  readonly loadingRows: number[] = [0, 1, 2, 3];

  isSeasonListOpen: boolean = false;
  displayedSeasonIndex: number = 0;
  // undefined while loading
  episodes: EpisodeItem[] | undefined = undefined;

  private subscription: Subscription = new Subscription();
  private loadCounter: number = 0;

  constructor(private readonly seriesService: SeriesService,
    private readonly downloadService: DownloadService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly globalFormattingService: GlobalFormattingService,
    private readonly historicWatchProgressService: HistoricWatchProgressService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] || changes['seasonIndex'] || changes['isConnected']) {
      this.displayedSeasonIndex = this.seasons[this.seasonIndex] ? this.seasonIndex : 0;
      this.loadEpisodes(this.displayedSeasonIndex);
    } else if (changes['currentEpisodeId'] && this.episodes) {
      // Next episode in the same season: the progress of the previous one changed
      this.episodes = this.episodes.map((item) => this.toItem(item.episode));
      this.scrollToCurrentEpisode();
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.subscription.unsubscribe();
  }

  get seasons(): SeasonModel[] {
    return this.series?.seasons ?? [];
  }

  get displayedSeason(): SeasonModel | undefined {
    return this.seasons[this.displayedSeasonIndex];
  }

  // Offline, the seasons without downloaded episode can't be opened
  isSeasonAvailable(season: SeasonModel): boolean {
    return this.isConnected || !season.hasNoEpisodes;
  }

  protected override onClose(): void {
    this.isSeasonListOpen = false;
  }

  onClickPanel(event: MouseEvent): void {
    event.stopPropagation();
    const select = this.seasonSelectRef?.nativeElement;
    if (this.isSeasonListOpen && select && !select.contains(event.target as Node)) {
      this.isSeasonListOpen = false;
    }
  }

  toggleSeasonList(): void {
    this.isSeasonListOpen = !this.isSeasonListOpen;
  }

  onSelectSeason(index: number): void {
    const season = this.seasons[index];
    this.isSeasonListOpen = false;
    if (!season || !this.isSeasonAvailable(season) || index === this.displayedSeasonIndex) return;
    this.displayedSeasonIndex = index;
    this.loadEpisodes(index);
  }

  onSelectEpisode(item: EpisodeItem): void {
    if (item.episode.id === this.currentEpisodeId) return;
    this.close();
    this.selectEpisode.emit({ episode: item.episode, seasonIndex: this.displayedSeasonIndex });
  }

  onPosterError(item: EpisodeItem): void {
    item.poster = this.srcEpisode;
  }

  private loadEpisodes(index: number): void {
    const season = this.seasons[index];
    const loadId = ++this.loadCounter;
    this.subscription.unsubscribe();
    if (!season) {
      this.episodes = [];
      return;
    }
    // The series page may already have loaded them
    if (this.isConnected && season.episodes?.length > 0) {
      this.setEpisodes(season.episodes);
      return;
    }
    this.episodes = undefined;
    const episodes$: Observable<EpisodeModel[]> = this.isConnected
      ? this.seriesService.fetchEpisodesBySeriesAndSeasonId(this.series.id, season.id)
      : this.downloadService.readAllEpisodesFromSeriesAndSeasonId(this.series.id, season.id);
    this.subscription = episodes$.pipe(take(1)).subscribe({
      next: (episodes: EpisodeModel[]) => {
        if (loadId === this.loadCounter) this.setEpisodes(episodes ?? []);
      },
      error: () => {
        if (loadId === this.loadCounter) this.episodes = [];
      }
    });
  }

  private setEpisodes(episodes: EpisodeModel[]): void {
    this.episodes = [...episodes]
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
      .map((episode) => this.toItem(episode));
    this.scrollToCurrentEpisode();
  }

  private toItem(episode: EpisodeModel): EpisodeItem {
    const progress = this.historicWatchProgressService.getHistoricEpisodeProgressById(episode.id, episode.watchProgress, episode.stateProgress);
    return {
      episode,
      poster: this.compressedPosterService.getEpisodePoster(episode) ?? this.srcEpisode,
      duration: this.globalFormattingService.getFormatEpisode(episode.duration),
      progress: progress.stateProgress === ProgressStateMedia.NOT_WATCHED ? 0 : progress.watchProgress,
      finished: progress.stateProgress === ProgressStateMedia.FINISHED
    };
  }

  // The list opens on the episode being played
  private scrollToCurrentEpisode(): void {
    setTimeout(() => {
      const list = this.episodeListRef?.nativeElement;
      const current = list?.querySelector<HTMLElement>('.episode-current');
      if (list && current) {
        list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.clientHeight / 2;
      }
    });
  }

}
