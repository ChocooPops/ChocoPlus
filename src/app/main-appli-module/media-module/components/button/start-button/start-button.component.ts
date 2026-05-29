import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
//import { Router } from '@angular/router';
import { MediaModel } from '../../../models/media.interface';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { StreamService } from '../../../../video-playing-module/services/stream/stream.service';
import { ChocoPlayerModel } from '../../../../video-playing-module/models/choco-player.interface';
import { SeasonModel } from '../../../models/series/season.interface';
import { MovieModel } from '../../../models/movie-model';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { SeriesService } from '../../../services/series/series.service';
import { firstValueFrom, take } from 'rxjs';
import { MediaProgressingModel } from '../../../../video-playing-module/models/media-progressing.interface';
import { HistoricWatchProgressService } from '../../../../video-playing-module/services/historic-watch-progress/historic-watch-progress.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-start-button',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './start-button.component.html',
  styleUrls: ['./start-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class StartButtonComponent {

  @Input() cursor: boolean = true;
  @Input() typeButton: boolean = false;
  @Input() typeDisplaying: boolean = false;
  @Input() media!: MediaModel;
  @Input() episode !: EpisodeModel;
  @Input() seasons !: SeasonModel[] | undefined;

  constructor(//private router: Router,
    private readonly streamService: StreamService,
    private readonly seriesService: SeriesService,
    private readonly historicWatchProgressService: HistoricWatchProgressService
  ) { }

  srcStartButton: string = "icon/start.svg";
  srcStartIcon: string = 'icon/start-icon.svg';

  public async onClick(): Promise<void> {
    if (!this.cursor) return;

    let chocoPlayer: ChocoPlayerModel = {
      MediaId: this.media.id,
      Title: this.media.title,
      Url: '',
      Height: window.innerHeight,
      Width: window.innerWidth,
      WatchProgress: 0,
      EpisodeId: -1,
      SeasonIndex: -1,
      SeasonMenu: []
    }
    if (this.media.mediaType === MediaTypeModel.MOVIE) {
      const historicProgress: MediaProgressingModel = this.historicWatchProgressService.getHistoricMovieProgressById(this.media.id, (this.media as MovieModel).watchProgress, (this.media as MovieModel).stateProgress);
      chocoPlayer.WatchProgress = historicProgress.watchProgress;
      chocoPlayer.Url = this.streamService.getUrlStreamMovie(this.media.id);
    } else if (this.media.mediaType === MediaTypeModel.SERIES) {
      if (this.episode && this.episode.id > 0) {
        chocoPlayer = this.setChocoPlayerForSeries(this.episode, chocoPlayer);
      } else {
        const episode: EpisodeModel = await firstValueFrom(
          this.seriesService.fetchLastWatchedEpisode(this.media.id).pipe(take(1))
        );
        chocoPlayer = this.setChocoPlayerForSeries(episode, chocoPlayer);
      }
    }
    
    await this.streamService.launchJavaAppToMovie(chocoPlayer);

    // if (this.media.mediaType === MediaTypeModel.MOVIE) {
    //   this.router.navigate(['/main-app/read-video', this.media.mediaType, this.media.id]);
    // } else if (this.media.mediaType === MediaTypeModel.SERIES) {
    //   if (this.idSeason && this.idEpisode) {
    //     this.router.navigate(['/main-app/read-video', this.media.mediaType, this.media.id, this.idSeason, this.idEpisode]);
    //   } else {
    //     this.router.navigate(['/main-app/read-video', this.media.mediaType, this.media.id, -1, -1]);
    //   }
    // }
  }

  private setChocoPlayerForSeries(episode: EpisodeModel, chocoPlayer: ChocoPlayerModel): ChocoPlayerModel {
    chocoPlayer.EpisodeId = episode.id;
    chocoPlayer.Title = `${chocoPlayer.Title} - ${episode.name}`;
    if (this.seasons) chocoPlayer.SeasonIndex = this.getSeasonIndexFromEpisodeId(this.seasons, episode.seasonId);
      const historicProgress: MediaProgressingModel = this.historicWatchProgressService.getHistoricEpisodeProgressById(episode.id, episode.watchProgress, episode.stateProgress);
      chocoPlayer.WatchProgress = historicProgress.watchProgress;
      chocoPlayer.Url = this.streamService.getUrlStreamEpisode(this.media.id, episode.id ?? -1);
      chocoPlayer.SeasonMenu = this.seasons ? this.seasons.map((season: SeasonModel) => ({
        Id: season.id,
        SeriesId: season.seriesId,
        Name: season.name,
        SeasonNumber: season.seasonNumber
    })) : [];
    return chocoPlayer;
  }

  private getSeasonIndexFromEpisodeId(seasons: SeasonModel[], seasonId: number): number {
    return seasons.findIndex((season) => season.id === seasonId);
  }

}
