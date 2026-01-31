import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { NewsVideoRunningModel } from '../../models/news-video-running.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { MovieModel } from '../../../media-module/models/movie-model';
import { SeriesModel } from '../../../media-module/models/series/series.interface';

@Injectable({
  providedIn: 'root'
})
export class NewsVideoRunningService {

  private readonly apiUrlNewsVideoRunning: string = `${environment.apiUrlNewsVideoRunning}`
  private readonly urlMovies: string = 'movies';
  private readonly urlSeries: string = 'series';

  private firstMoviePresentation: NewsVideoRunningModel | undefined = undefined;
  private firstSeriesPresentation: NewsVideoRunningModel | undefined = undefined;

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) { }

  private getEmptyNewsMedia(mediaType: MediaTypeModel): NewsVideoRunningModel {
    return {
      id: -1,
      jellyfinId: undefined,
      srcBackground: undefined,
      startShow: '',
      endShow: '',
      media:
      {
        id: -1,
        title: 'Nameless',
        jellyfinId: 'undefined',
        typeZoomX: false,
        typeZoomY: false,
        isInList: false,
        mediaType: mediaType
      }
    }
  }

  public fetchRandomNewsMovieRunning(): Observable<NewsVideoRunningModel> {
    if (!this.firstMoviePresentation) {
      return this.http.get<any>(`${this.apiUrlNewsVideoRunning}/${this.urlMovies}`).pipe(
        map((data: NewsVideoRunningModel) => {
          const movie: MovieModel = this.movieService.createNewMovie(data.media);
          this.firstMoviePresentation = {
            id: data.id,
            jellyfinId: data.jellyfinId && data.jellyfinId.trim() !== '' ? data.jellyfinId : movie.jellyfinId,
            srcBackground: data.srcBackground ? data.srcBackground : undefined,
            startShow: data.startShow ? data.startShow : '00:10:00',
            endShow: data.endShow ? data.endShow : '00:11:30',
            media: movie
          }
          return this.firstMoviePresentation;
        }),
        catchError((error) => {
          return of(this.getEmptyNewsMedia(MediaTypeModel.MOVIE));
        })
      )
    } else {
      return of(this.firstMoviePresentation);
    }
  }

  public fetchRandomSeriesRunning(): Observable<NewsVideoRunningModel> {
    if (!this.firstSeriesPresentation) {
      return this.http.get<any>(`${this.apiUrlNewsVideoRunning}/${this.urlSeries}`).pipe(
        map((data: NewsVideoRunningModel) => {
          const series: SeriesModel = this.seriesService.createNewSeries(data.media);
          this.firstSeriesPresentation = {
            id: data.id,
            jellyfinId: data.jellyfinId && data.jellyfinId.trim() !== '' ? data.jellyfinId : undefined,
            srcBackground: data.srcBackground ? data.srcBackground : undefined,
            startShow: data.startShow ? data.startShow : '00:04:00',
            endShow: data.endShow ? data.endShow : '00:05:30',
            media: series
          }
          return this.firstSeriesPresentation;
        }),
        catchError((error) => {
          return of(this.getEmptyNewsMedia(MediaTypeModel.SERIES));
        })
      )
    } else {
      return of(this.firstSeriesPresentation);
    }
  }

  public changeMysList(mediaId: number, state: boolean): void {
    if (this.firstMoviePresentation && this.firstMoviePresentation.media.id === mediaId) {
      this.firstMoviePresentation.media.isInList = state;
    }
    if (this.firstSeriesPresentation && this.firstSeriesPresentation.media.id === mediaId) {
      this.firstSeriesPresentation.media.isInList = state;
    }
  }

}
