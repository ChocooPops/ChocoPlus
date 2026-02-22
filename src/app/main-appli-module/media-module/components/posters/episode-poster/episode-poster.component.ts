import { Component, Input, SimpleChanges } from '@angular/core';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { VerifTimerShowService } from '../../../../common-module/services/verif-timer/verif-timer-show.service';
import { DatePipe } from '@angular/common';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SeriesModel } from '../../../models/series/series.interface';
import { ProgressStateMedia } from '../../../models/progress-state-media.enum';
import { HistoricWatchProgressService } from '../../../../video-playing-module/services/historic-watch-progress/historic-watch-progress.service';
import { MediaProgressingModel } from '../../../../video-playing-module/models/media-progressing.interface';

@Component({
  selector: 'app-episode-poster',
  standalone: true,
  imports: [DatePipe, StartButtonComponent],
  templateUrl: './episode-poster.component.html',
  styleUrl: './episode-poster.component.css'
})
export class EpisodePosterComponent {

  @Input() series!: SeriesModel;
  @Input() episodes!: EpisodeModel[];
  @Input() notRunning: boolean = true;

  episodePoster: any[] = [];
  episodeProgress: MediaProgressingModel[] = [];
  type: MediaTypeModel = MediaTypeModel.SERIES;
  ProgressState = ProgressStateMedia;

  constructor(private readonly verifTimerShowService: VerifTimerShowService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly historicWatchProgressService: HistoricWatchProgressService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['episodes']) {
      this.episodePoster = this.episodes.map((episode: EpisodeModel) =>
        this.compressedPosterService.getEpisodePoster(episode)
      );
      this.episodeProgress = this.episodes.map((episode: EpisodeModel) =>
        this.historicWatchProgressService.getHistoricEpisodeProgressById(episode.id, episode.watchProgress, episode.stateProgress)
      );
    }
  }

  getTimerEpisode(timer: number): string {
    return this.verifTimerShowService.getFormatEpisode(timer)
  }

}
