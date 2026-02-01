import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, take, throwError } from 'rxjs';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { environment } from '../../../../../environments/environment';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { HttpClient } from '@angular/common/http';
import { MovieModel } from '../../../media-module/models/movie-model';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { MediaModel } from '../../../media-module/models/media.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { EditNewsVideoRunningModel } from '../../models/edit-news-video-running.interface';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';

@Injectable({
  providedIn: 'root'
})
export class EditNewsVideoRunningService {

  private readonly apiUrlNewsVideoRunning: string = `${environment.apiUrlNewsVideoRunning}`;
  private readonly urlNewsMovie: string = 'all-movies';
  private readonly urlNewsSeries: string = 'all-series';
  private readonly urlModifyNewsMovie: string = 'movies';
  private readonly urlModifyNewsSeries: string = 'series';

  private editNewsVideoRunningSubject: BehaviorSubject<NewsVideoRunningModel[]> = new BehaviorSubject<NewsVideoRunningModel[]>([]);
  private editNewsVideoRunning$: Observable<NewsVideoRunningModel[]> = this.editNewsVideoRunningSubject.asObservable();

  constructor(private movieService: MovieService,
    private seriesService: SeriesService,
    private http: HttpClient
  ) { }

  private getId(): number {
    const edit: NewsVideoRunningModel[] = this.editNewsVideoRunningSubject.value;
    return (edit.length > 0 ? Math.max(...edit.map(item => item.id)) : 0) + 1;
  }

  public getNewsVideoRunning(): Observable<NewsVideoRunningModel[]> {
    return this.editNewsVideoRunning$;
  }

  public resetEditNewsRunningVideo(): void {
    this.editNewsVideoRunningSubject.next([]);
  }

  public fetchAllNewsMovieRunning(): Observable<void> {
    return this.http.get<any>(`${this.apiUrlNewsVideoRunning}/${this.urlNewsMovie}`).pipe(
      map((data: NewsVideoRunningModel[]) => {
        const news: NewsVideoRunningModel[] = [];
        data.forEach((item: NewsVideoRunningModel) => {
          const movie: MovieModel = this.movieService.createNewMovie(item.media);
          news.push({
            id: item.id,
            jellyfinId: item.jellyfinId,
            srcBackground: item.srcBackground,
            startShow: item.startShow,
            endShow: item.endShow,
            media: movie
          })
        })
        this.editNewsVideoRunningSubject.next(news);
      }),
      catchError((error: any) => {
        this.editNewsVideoRunningSubject.next([]);
        return of();
      })
    )
  }

  public fetchAllNewsSeriesRunning(): Observable<void> {
    return this.http.get<any>(`${this.apiUrlNewsVideoRunning}/${this.urlNewsSeries}`).pipe(
      map((data: NewsVideoRunningModel[]) => {
        const news: NewsVideoRunningModel[] = [];
        data.forEach((item: NewsVideoRunningModel) => {
          const series: SeriesModel = this.seriesService.createNewSeries(item.media);
          news.push({
            id: item.id,
            jellyfinId: item.jellyfinId,
            srcBackground: item.srcBackground,
            startShow: item.startShow,
            endShow: item.endShow,
            media: series
          })
        })
        this.editNewsVideoRunningSubject.next(news);
      }),
      catchError((error) => {
        this.editNewsVideoRunningSubject.next([]);
        return of();
      })
    )
  }

  public addMediaIntoNews(media: MediaModel): void {
    const news: NewsVideoRunningModel[] = this.editNewsVideoRunningSubject.value;
    const exists = news.some(item => item.media.id === media.id);
    if (!exists) {
      news.push({
        id: this.getId(),
        jellyfinId: media.mediaType === MediaTypeModel.MOVIE ? media.jellyfinId : undefined,
        srcBackground: media.srcBackgroundImage,
        startShow: media.startShow ? media.startShow : '00:00:00',
        endShow: media.endShow ? media.endShow : '00:00:00',
        media: media
      })
    }
    this.editNewsVideoRunningSubject.next(news);
  }

  public deleteMediaIntoNews(id: number): void {
    const news: NewsVideoRunningModel[] = this.editNewsVideoRunningSubject.value.filter((item) => item.id !== id);
    this.editNewsVideoRunningSubject.next(news);
  }

  public modifyStartShowById(id: number, timer: string): void {
    const news: NewsVideoRunningModel[] = this.editNewsVideoRunningSubject.value;
    const index: number = news.findIndex((item: NewsVideoRunningModel) => item.id === id);
    if (index >= 0) {
      news[index].startShow = timer;
      this.editNewsVideoRunningSubject.next(news);
    }
  }

  public modifyEndShowById(id: number, timer: string): void {
    const news: NewsVideoRunningModel[] = this.editNewsVideoRunningSubject.value;
    const index: number = news.findIndex((item: NewsVideoRunningModel) => item.id === id);
    if (index >= 0) {
      news[index].endShow = timer;
      this.editNewsVideoRunningSubject.next(news);
    }
  }

  public modifySrcBackground(id: number, srcBackground: string): void {
    const news: NewsVideoRunningModel[] = this.editNewsVideoRunningSubject.value;
    const index: number = news.findIndex((item: NewsVideoRunningModel) => item.id === id);
    if (index >= 0) {
      news[index].srcBackground = srcBackground;
    }
  }

  public modifyJellyfinId(id: number, jellyfinId: string): void {
    const news: NewsVideoRunningModel[] = this.editNewsVideoRunningSubject.value;
    const index: number = news.findIndex((item: NewsVideoRunningModel) => item.id === id);
    if (index >= 0) {
      news[index].jellyfinId = jellyfinId;
    }
  }

  public fetchModifyNewsMovieRunning(): Observable<MessageReturnedModel> {
    const news: EditNewsVideoRunningModel[] = this.getEditNewVideoRunningFormated();
    return this.http.put<any>(`${this.apiUrlNewsVideoRunning}/${this.urlModifyNewsMovie}`, news).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.fetchAllNewsMovieRunning().pipe(take(1)).subscribe(() => { });
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchModifyNewsSeriesRunning(): Observable<MessageReturnedModel> {
    const news: EditNewsVideoRunningModel[] = this.getEditNewVideoRunningFormated();
    return this.http.put<any>(`${this.apiUrlNewsVideoRunning}/${this.urlModifyNewsSeries}`, news).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.fetchAllNewsSeriesRunning().pipe(take(1)).subscribe(() => { });
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  private getEditNewVideoRunningFormated(): EditNewsVideoRunningModel[] {
    return this.editNewsVideoRunningSubject.value.map((news: NewsVideoRunningModel) => ({
      id: news.id,
      jellyfinId: news.jellyfinId,
      mediaId: news.media.id,
      mediaType: news.media.mediaType,
      srcBackground: news.srcBackground,
      startShow: news.startShow,
      endShow: news.endShow
    }))
  }

}
