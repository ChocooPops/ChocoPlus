import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SeriesModel } from '../../../models/series/series.interface';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { MediaProgressingModel } from '../../../../video-playing-module/models/media-progressing.interface';
import { ProgressStateMedia } from '../../../models/progress-state-media.enum';
import { VerifTimerShowService } from '../../../../common-module/services/verif-timer/verif-timer-show.service';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { HistoricWatchProgressService } from '../../../../video-playing-module/services/historic-watch-progress/historic-watch-progress.service';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-episode-poster-horizontal-view',
  standalone: true,
  imports: [StartButtonComponent, DatePipe, TranslatePipe],
  templateUrl: './episode-poster-horizontal-view.component.html',
  styleUrl: './episode-poster-horizontal-view.component.css',
})
export class EpisodePosterHorizontalViewComponent {
  @Input() series!: SeriesModel;
  @Input() episodes!: EpisodeModel[];
  @Input() notRunning: boolean = true;

  episodePoster: any[] = [];
  episodeProgress: MediaProgressingModel[] = [];
  ProgressState = ProgressStateMedia;

  height!: number;
  width!: number;
  gap!: number;
  srcIconInfo: string = 'icon/info.svg';

  private subscription!: Subscription;

  constructor(
    private readonly verifTimerShowService: VerifTimerShowService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly historicWatchProgressService: HistoricWatchProgressService,
    private readonly paginationPosterService: PaginationPosterService,
  ) {}

  ngOnInit(): void {
    this.subscription = this.paginationPosterService
      .getVerticalGeometricDimensionSelection()
      .subscribe((data: GeometricDimensionSelectionModel) => {
        this.width =
          this.paginationPosterService.getRealHeighVerticalVerticalPoster();
        this.height = data.widthPoster * 0.9;
        this.gap = data.gapBetweenPoster * 2;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['episodes']) {
      this.episodePoster = this.episodes.map((episode: EpisodeModel) =>
        this.compressedPosterService.getEpisodePoster(episode),
      );
      this.episodeProgress = this.episodes.map((episode: EpisodeModel) =>
        this.historicWatchProgressService.getHistoricEpisodeProgressById(
          episode.id,
          episode.watchProgress,
          episode.stateProgress,
        ),
      );
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getTimerEpisode(timer: number): string {
    return this.verifTimerShowService.getFormatEpisode(timer);
  }
}
