import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../launch-module/services/auth/auth.service';
import { ChocoPlayerModel } from '../../models/choco-player.interface';
//import { MovieService } from '../../../media-module/services/movie/movie.service';
//import { SeriesService } from '../../../media-module/services/series/series.service';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { HistoricWatchProgressService } from '../historic-watch-progress/historic-watch-progress.service';
import { ProcessStatus } from '../../models/process-status.enum';
import { TranslationLanguageService } from '../../../../common-module/services/translation-language/translation-language.service';
import { VerifUserAlreadyConnectedService } from '../../../../launch-module/services/verif-user-already-connected/verif-user-already-connected.service';
import { UserHistoricService } from '../../../user-module/service/user-historic/user-historic.service';

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

  constructor(private readonly authService: AuthService,
    //private readonly movieService: MovieService,
    //private readonly seriesService: SeriesService,
    private readonly historicWatchProgressService: HistoricWatchProgressService,
    private readonly translationLanguageService: TranslationLanguageService,
    private readonly verifConnection: VerifUserAlreadyConnectedService,
    private readonly userHistoricService: UserHistoricService
  ) {
    window.electron.onChocoPlayerStatus((data: ChocoPlayerModel) => {
      if (data.status && Object.values(ProcessStatus).includes(data.status)) {
        this.csharpProcessStatusSubject.next(data.status);
      }
      this.setWatchProgressByMediaOffLine(data);
      if (this.verifConnection.IsConnectedValue()) {
        this.setWatchProgressByMediaOnline(data);
      }
    });
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
    if (!chocoPlayer.StateProgress) return;
    
    if (chocoPlayer.EpisodeId && chocoPlayer.EpisodeId > 0) {
      this.historicWatchProgressService.updateHistoricEpisodeById(chocoPlayer.EpisodeId, chocoPlayer.WatchProgress, chocoPlayer.StateProgress);
    } else if (chocoPlayer.MediaId && chocoPlayer.MediaId > 0) {
      this.historicWatchProgressService.updateHistoricMovieById(chocoPlayer.MediaId, chocoPlayer.WatchProgress, chocoPlayer.StateProgress);
    }
  }

}
