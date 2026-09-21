import { Component, Input, SimpleChanges } from '@angular/core';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { GlobalFormattingService } from '../../../../common-module/services/verif-timer/global-formatting.service';
import { DatePipe } from '@angular/common';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SeriesModel } from '../../../models/series/series.interface';
import { ProgressStateMedia } from '../../../models/progress-state-media.enum';
import { HistoricWatchProgressService } from '../../../../video-playing-module/services/historic-watch-progress/historic-watch-progress.service';
import { MediaProgressingModel } from '../../../../video-playing-module/models/media-progressing.interface';
import { NewsAlertComponent } from '../news-alert/news-alert.component';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadButtonComponent } from '../../button/download-button/download-button.component';
import { UserModel } from '../../../../user-module/dto/user.model';
import { RoleModel } from '../../../../../common-module/models/role.enum';

@Component({
  selector: 'app-episode-poster-vertical-view',
  standalone: true,
  imports: [DatePipe, NewsAlertComponent, StartButtonComponent, DownloadButtonComponent],
  templateUrl: './episode-poster-vertical-view.component.html',
  styleUrls: ['./episode-poster-vertical-view.component.css', '../../../../common-module/styles/animation.css']
})
export class EpisodePosterVerticalViewComponent {

  @Input() series!: SeriesModel;
  @Input() episodes!: EpisodeModel[];
  @Input() notRunning: boolean = true;
  @Input() user!: UserModel | undefined;

  episodePoster: any[] = [];
  episodeProgress: MediaProgressingModel[] = [];
  ProgressState = ProgressStateMedia;
  srcEpisode: string = 'icon/episode.svg';

  MediaType = MediaTypeModel;
  Role = RoleModel;

  constructor(private readonly globalFormattingService: GlobalFormattingService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly historicWatchProgressService: HistoricWatchProgressService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['episodes']) {
      this.episodePoster = this.episodes.map((episode: EpisodeModel) =>
        this.compressedPosterService.getEpisodePoster(episode) ?? this.srcEpisode
      );
      this.episodeProgress = this.episodes.map((episode: EpisodeModel) =>
        this.historicWatchProgressService.getHistoricEpisodeProgressById(episode.id, episode.watchProgress, episode.stateProgress)
      );
    }
  }

  getTimerEpisode(timer: number): string {
    return this.globalFormattingService.getFormatEpisode(timer)
  }

  getBytesEpisode(bytes: number): string {
    return this.globalFormattingService.convertBytesToMegaOrGiga(bytes)
  }

  onError(idx: number): void {
    this.episodePoster[idx] = this.srcEpisode;
  }

}
