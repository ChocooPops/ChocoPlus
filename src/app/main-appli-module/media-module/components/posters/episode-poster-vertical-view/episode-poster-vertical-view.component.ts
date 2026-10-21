import { Component, Input, SimpleChanges } from '@angular/core';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { GlobalFormattingService } from '../../../../common-module/services/global-formatting/global-formatting.service';
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
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-episode-poster-vertical-view',
  standalone: true,
  imports: [DatePipe, NewsAlertComponent, StartButtonComponent, DownloadButtonComponent, TranslatePipe],
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
  srcNoContent: string = 'icon/no-content.svg';
  readonly srcSuccess: string = 'icon/success.svg';

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

  getCurrentTimeProgress(idx: number): string {
    const duration: number = this.episodes[idx]?.duration ?? 0;
    return this.globalFormattingService.formatDuration(duration * this.episodeProgress[idx].watchProgress / 100);
  }

  getRemainingTimeProgress(idx: number): string {
    const duration: number = this.episodes[idx]?.duration ?? 0;
    return this.globalFormattingService.formatDuration(duration * (100 - this.episodeProgress[idx].watchProgress) / 100);
  }

  onError(idx: number): void {
    this.episodePoster[idx] = this.srcEpisode;
  }

}
