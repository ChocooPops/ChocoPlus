import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { PlayerSessionService } from '../player-session/player-session.service';
import { AuthService } from '../../../../launch-module/services/auth/auth.service';
import { ChocoPlayerModel } from '../../models/choco-player.interface';
import { PlayerLaunchRequest, PlayerMediaInfo, PlayerPgsDisplaySetsEvent, PlayerStreamErrorEvent, PlayerSubtitleCuesEvent } from '../../models/player.interface';
import { MediaModel } from '../../../media-module/models/media.interface';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { ProgressStateMedia } from '../../../media-module/models/progress-state-media.enum';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { MediaProgressingModel } from '../../models/media-progressing.interface';
//import { MovieService } from '../../../media-module/services/movie/movie.service';
//import { SeriesService } from '../../../media-module/services/series/series.service';
import { BehaviorSubject, Observable, firstValueFrom, take, timeout } from 'rxjs';
import { HistoricWatchProgressService } from '../historic-watch-progress/historic-watch-progress.service';
import { ProcessStatus } from '../../models/process-status.enum';
import { TranslationLanguageService } from '../../../../common-module/services/translation-language/translation-language.service';
import { VerifUserAlreadyConnectedService } from '../../../../launch-module/services/verif-user-already-connected/verif-user-already-connected.service';
import { UserHistoricService } from '../../../user-module/service/user-historic/user-historic.service';
import { VideoPlayerService } from '../../../common-module/services/video-player/video-player.service';
import { VideoPlayerModel } from '../../../common-module/models/video-player.enum';
import { MediaFocusService } from '../../../../common-module/services/media-focus/media-focus.service';

declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  
  private readonly apiUrlStream: string = `${environment.apiUrlStream}`;
  private readonly urlGetStreamMovie: string = 'stream-movie';
  private readonly urlGetStreamEpisode: string = 'stream-episode';
  private readonly urlGetStreamNewsVideoRunning: string = 'stream-news';
  private readonly paramToken: string = 'token';

  private csharpProcessStatusSubject: BehaviorSubject<ProcessStatus> = new BehaviorSubject<ProcessStatus>(ProcessStatus.CLOSED);
  private csharpProcessStatus$: Observable<ProcessStatus> = this.csharpProcessStatusSubject.asObservable();

  private readonly FINISHED_RATE: number = 93;
  private readonly SERVER_SAVE_TIMEOUT_MS: number = 3000;
  // Media being played in the internal player, to save its progress when the app closes
  private activePlayback: { request: PlayerLaunchRequest, getProgress: () => number | null } | null = null;
  // Last progress the server confirmed, per media ("MOVIE-12", "EPISODE-34"): the same value isn't sent twice
  private readonly progressSentToServer = new Map<string, number>();
  // ChocoPlayer running: the trailers and the game music of the app pause until it closes
  private readonly chocoPlayerFocus: symbol = Symbol('choco-player');

  constructor(private readonly playerSessionService: PlayerSessionService,
    private readonly authService: AuthService,
    //private readonly movieService: MovieService,
    //private readonly seriesService: SeriesService,
    private readonly historicWatchProgressService: HistoricWatchProgressService,
    private readonly translationLanguageService: TranslationLanguageService,
    private readonly verifConnection: VerifUserAlreadyConnectedService,
    private readonly userHistoricService: UserHistoricService,
    private readonly videoPlayerService: VideoPlayerService,
    private readonly mediaFocusService: MediaFocusService
  ) {
    window.electron.onChocoPlayerStatus((data: ChocoPlayerModel) => {
      if (data.status && Object.values(ProcessStatus).includes(data.status)) {
        this.csharpProcessStatusSubject.next(data.status);
        if (data.status === ProcessStatus.CLOSED) {
          this.mediaFocusService.release(this.chocoPlayerFocus);
        } else {
          this.mediaFocusService.claim(this.chocoPlayerFocus);
        }
      }
      this.setWatchProgressByMediaOffLine(data);
      if (this.verifConnection.IsConnectedValue()) {
        this.setWatchProgressByMediaOnline(data);
      }
    });
    window.electron.player.onFlushProgress(() => this.flushActivePlayback());
  }

  public getCsharpProcessStatus(): Observable<ProcessStatus> {
    return this.csharpProcessStatus$;
  }

  public getUrlStreamMovie(movieId: number): string {
    const token: string = this.authService.getToken() ?? '';
    return `${this.apiUrlStream}/${this.urlGetStreamMovie}/${movieId}?${this.paramToken}=${token}`;
  }

  public getUrlStreamEpisode(seasonId: number, episodeId: number): string {
    const token: string = this.authService.getToken() ?? '';
    return `${this.apiUrlStream}/${this.urlGetStreamEpisode}/${seasonId}/${episodeId}?${this.paramToken}=${token}`;
  }

  public getUrlStreamNews(newsId: number): string {
    const token: string = this.authService.getToken() ?? '';
    return `${this.apiUrlStream}/${this.urlGetStreamNewsVideoRunning}/${newsId}?${this.paramToken}=${token}`;
  }

  public async launchJavaAppToMovie(chocoPlayer: ChocoPlayerModel): Promise<void> {
    if (this.translationLanguageService.getIsShowingKeysValue()) {
      chocoPlayer.Language = 'none';
    } else {
      chocoPlayer.Language = this.translationLanguageService.getCurrentLangValue();
    }
    await window.electron.invoke('launch-choco-player', chocoPlayer);
  }

  //=========================== INTERNAL PLAYER ===========================//

  // Plays a movie or an episode, in the player chosen in the app settings: in the app (VideoPlayingComponent)
  // or in the external ChocoPlayer. media: the movie / series (for the episodes menu of the in-app player)
  public async launchPlayer(chocoPlayer: ChocoPlayerModel, media?: MediaModel): Promise<void> {
    if (this.videoPlayerService.getVideoPlayer() === VideoPlayerModel.CHOCO_PLAYER) {
      await this.launchJavaAppToMovie(chocoPlayer);
      return;
    }
    const isSeries = chocoPlayer.MediaType === MediaTypeModel.SERIES;
    const request: PlayerLaunchRequest = {
      mediaType: isSeries ? MediaTypeModel.SERIES : MediaTypeModel.MOVIE,
      mediaId: chocoPlayer.MediaId,
      seasonId: isSeries ? chocoPlayer.SeasonId : -1,
      episodeId: isSeries ? chocoPlayer.EpisodeId : -1,
      seasonIndex: chocoPlayer.SeasonIndex,
      title: chocoPlayer.Title,
      url: chocoPlayer.Url,
      watchProgress: chocoPlayer.WatchProgress ?? 0,
      isConnected: chocoPlayer.IsConnected,
      media
    };
    this.openInternalPlayer(request);
  }

  // Another episode of a series, from the internal player (episodes menu, next episode).
  // An episode already watched to the end starts over. keepMode: stays in the mini player if it is open.
  public async launchEpisode(seriesId: number, series: SeriesModel | undefined, episode: EpisodeModel, seasonIndex: number,
    isConnected: boolean, keepMode: boolean = false): Promise<void> {
    const historic: MediaProgressingModel = this.historicWatchProgressService.getHistoricEpisodeProgressById(episode.id, episode.watchProgress, episode.stateProgress);
    this.openInternalPlayer({
      mediaType: MediaTypeModel.SERIES,
      mediaId: seriesId,
      seasonId: episode.seasonId,
      episodeId: episode.id,
      seasonIndex,
      title: series?.title ? `${series.title} - ${episode.name}` : episode.name,
      url: this.getUrlStreamEpisode(episode.seasonId, episode.id),
      watchProgress: historic.stateProgress === ProgressStateMedia.FINISHED ? 0 : historic.watchProgress,
      isConnected,
      media: series
    }, keepMode);
  }

  // The internal player is shown over the current page (no navigation): it works in the main app and offline
  private openInternalPlayer(request: PlayerLaunchRequest, keepMode: boolean = false): void {
    this.playerSessionService.open(request, keepMode);
  }

  // Lists the tracks of the media (downloaded file first, else the server stream) and makes it playable
  public preparePlayback(request: PlayerLaunchRequest): Promise<PlayerMediaInfo> {
    return window.electron.player.prepare({
      mediaType: request.mediaType,
      mediaId: request.mediaId,
      seasonId: request.seasonId,
      episodeId: request.episodeId,
      url: request.url
    });
  }

  public releasePlayback(sourceId: string): void {
    window.electron.player.release(sourceId).catch(() => { });
  }

  public onPlayerSubtitleCues(callback: (event: PlayerSubtitleCuesEvent) => void): () => void {
    return window.electron.player.onSubtitleCues(callback);
  }

  public onPlayerPgsDisplaySets(callback: (event: PlayerPgsDisplaySetsEvent) => void): () => void {
    return window.electron.player.onPgsDisplaySets(callback);
  }

  // ChocoPlayer was launched while the internal player played: the main process saved its progress and stopped it
  public onPlayerClosedByChocoPlayer(callback: () => void): () => void {
    return window.electron.player.onClosedByChocoPlayer(callback);
  }

  public onPlayerStreamError(callback: (event: PlayerStreamErrorEvent) => void): () => void {
    return window.electron.player.onStreamError(callback);
  }

  // The player declares what it plays and how to read where it is (null: nothing to save yet)
  public setActivePlayback(request: PlayerLaunchRequest, getProgress: () => number | null): void {
    this.activePlayback = { request, getProgress };
  }

  public clearActivePlayback(request: PlayerLaunchRequest): void {
    if (this.activePlayback?.request === request) {
      this.activePlayback = null;
    }
  }

  // The window is closing (or the app reloads / quits): the player component won't be destroyed,
  // so the progress of the media being played is saved here, the main process waits for it
  private async flushActivePlayback(): Promise<void> {
    const playback = this.activePlayback;
    const progress = playback?.getProgress() ?? null;
    if (!playback || progress === null) return;
    await this.saveInternalPlayerProgress(playback.request, progress);
  }

  // Same bookkeeping as the progress sent by ChocoPlayer: downloaded metadata, local history, server history.
  // The server is only sent a value it doesn't already have. Resolves once everything is saved.
  public async saveInternalPlayerProgress(request: PlayerLaunchRequest, progress: number): Promise<void> {
    const watchProgress: number = Math.round(Math.min(100, Math.max(0, progress)) * 100) / 100;
    const isEpisode: boolean = request.mediaType === MediaTypeModel.SERIES;
    const stateProgress: ProgressStateMedia = watchProgress === 0
      ? ProgressStateMedia.NOT_WATCHED
      : watchProgress < this.FINISHED_RATE ? ProgressStateMedia.IN_PROGRESS : ProgressStateMedia.FINISHED;

    const savedOnDisk: Promise<void> = window.electron.player.saveProgress({
      mediaType: request.mediaType,
      mediaId: request.mediaId,
      seasonId: request.seasonId,
      episodeId: request.episodeId,
      progress: watchProgress
    }).catch(() => { });

    const data = {
      MediaId: isEpisode ? -1 : request.mediaId,
      EpisodeId: isEpisode ? request.episodeId : -1,
      WatchProgress: watchProgress,
      StateProgress: stateProgress
    } as ChocoPlayerModel;
    this.setWatchProgressByMediaOffLine(data);

    await Promise.all([savedOnDisk, this.sendProgressToServer(isEpisode, data, watchProgress)]);
  }

  private async sendProgressToServer(isEpisode: boolean, data: ChocoPlayerModel, watchProgress: number): Promise<void> {
    if (!this.verifConnection.IsConnectedValue()) return;
    const key: string = isEpisode ? `${MediaTypeModel.EPISODE}-${data.EpisodeId}` : `${MediaTypeModel.MOVIE}-${data.MediaId}`;
    if (this.progressSentToServer.get(key) === watchProgress) return;

    const request$: Observable<MediaProgressingModel | null> = isEpisode
      ? this.userHistoricService.saveWathcingProgressUserForEpisode(data.EpisodeId, watchProgress)
      : this.userHistoricService.saveWathcingProgressUserForMovie(data.MediaId, watchProgress);
    // The service answers null when the request failed: the value will be sent again next time
    const result = await firstValueFrom(request$.pipe(timeout(this.SERVER_SAVE_TIMEOUT_MS))).catch(() => null);
    if (result !== null) {
      this.progressSentToServer.set(key, watchProgress);
    }
  }

  private setWatchProgressByMediaOnline(chocoPlayer: ChocoPlayerModel): void {
    if (chocoPlayer.WatchProgress >= 0) {
      if (chocoPlayer?.EpisodeId > 0) {
        // this.seriesService.fetchGetWatchProgressForEpisode(chocoPlayer.EpisodeId).pipe(take(1)).subscribe((data) => {
        //   this.historicWatchProgressService.updateHistoricEpisodeById(chocoPlayer.EpisodeId, data.watchProgress, data.state);
        // });
        this.userHistoricService.saveWathcingProgressUserForEpisode(chocoPlayer.EpisodeId, chocoPlayer.WatchProgress)
          .pipe(take(1))
          .subscribe();
      } else if (chocoPlayer?.MediaId > 0) {
        // this.movieService.fetchGetWatchProgressForMovie(chocoPlayer.MediaId).pipe(take(1)).subscribe((data) => {
        //   this.historicWatchProgressService.updateHistoricMovieById(chocoPlayer.MediaId, data.watchProgress, data.state);
        // });
        this.userHistoricService.saveWathcingProgressUserForMovie(chocoPlayer.MediaId, chocoPlayer.WatchProgress)
          .pipe(take(1))
          .subscribe()
      }
    }
  }

  private setWatchProgressByMediaOffLine(chocoPlayer: ChocoPlayerModel): void {
    if (!chocoPlayer.StateProgress || !chocoPlayer.WatchProgress) return;
    
    if (chocoPlayer.EpisodeId && chocoPlayer.EpisodeId > 0) {
      this.historicWatchProgressService.updateHistoricEpisodeById(chocoPlayer.EpisodeId, chocoPlayer.WatchProgress, chocoPlayer.StateProgress);
    } else if (chocoPlayer.MediaId && chocoPlayer.MediaId > 0) {
      this.historicWatchProgressService.updateHistoricMovieById(chocoPlayer.MediaId, chocoPlayer.WatchProgress, chocoPlayer.StateProgress);
    }
  }

}
