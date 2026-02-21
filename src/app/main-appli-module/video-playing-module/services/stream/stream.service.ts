import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../launch-module/services/auth/auth.service';
import { ChocoPlayerModel } from '../../models/choco-player.interface';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { take } from 'rxjs';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { LicenseService } from '../../../license-module/service/license/licence.service';
import { NewsService } from '../../../news-module/services/news/news.service';
import { NewsVideoRunningService } from '../../../news-module/services/news-video-running/news-video-running.service';
import { UserService } from '../../../user-module/service/user/user.service';

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

  constructor(private readonly authService: AuthService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly selectionService: SelectionService,
    private readonly licenseService: LicenseService,
    private readonly newsService: NewsService,
    private readonly newsVideoRunningService: NewsVideoRunningService,
    private readonly userService: UserService
  ) {
    window.electron.onChocoPlayerStatus((data: ChocoPlayerModel) => {
      this.setWatchProgressByMedia(data);
    });
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

  public async launchJavaAppToMovie(
    chocoPlayer: ChocoPlayerModel,
  ): Promise<void> {
    await window.electron.invoke('launch-choco-player', chocoPlayer);
  }

  private setWatchProgressByMedia(chocoPlayer: ChocoPlayerModel): void {
    if (chocoPlayer.EpisodeId && chocoPlayer.EpisodeId > 0) {
      this.seriesService.fetchGetWatchProgressForEpisode(chocoPlayer.EpisodeId).pipe(take(1)).subscribe((watchProgress: number) => {
        this.selectionService.changeWatchProgressIntoHomeSelection(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.SERIES, watchProgress);
        this.selectionService.changeWatchProgressIntoSeriesSelection(chocoPlayer.MediaId, chocoPlayer.EpisodeId, watchProgress);
        this.licenseService.changeWatchProgressIntoHomeLicense(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.SERIES, watchProgress);
        this.licenseService.changeWatchProgressIntoResearchSelection(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.SERIES, watchProgress);
        this.newsService.changeWatchProgressIntoNews(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.SERIES, watchProgress);
        this.newsVideoRunningService.changeWatchProgressIntoSeriesNews(chocoPlayer.MediaId, chocoPlayer.EpisodeId, watchProgress);
        this.userService.changeWatchProgressIntoMyList(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.SERIES, watchProgress);
      });
    } else if (chocoPlayer.MediaId && chocoPlayer.MediaId > 0) {
      this.movieService.fetchGetWatchProgressForMovie(chocoPlayer.MediaId).pipe(take(1)).subscribe((watchProgress: number) => {
        this.selectionService.changeWatchProgressIntoHomeSelection(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.MOVIE, watchProgress);
        this.selectionService.changeWatchProgressIntoMoviesSelection(chocoPlayer.MediaId, watchProgress);
        this.licenseService.changeWatchProgressIntoHomeLicense(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.MOVIE, watchProgress);
        this.licenseService.changeWatchProgressIntoResearchSelection(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.MOVIE, watchProgress);
        this.newsService.changeWatchProgressIntoNews(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.MOVIE, watchProgress);
        this.newsVideoRunningService.changeWatchProgressIntoMovieNews(chocoPlayer.MediaId, watchProgress);
        this.userService.changeWatchProgressIntoMyList(chocoPlayer.MediaId, chocoPlayer.EpisodeId, MediaTypeModel.MOVIE, watchProgress);
      });
    }
  }

}
