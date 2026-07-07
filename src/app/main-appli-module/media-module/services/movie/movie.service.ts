import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, catchError } from 'rxjs';
import { VerifTimerShowService } from '../../../common-module/services/verif-timer/verif-timer-show.service';
import { MovieModel } from '../../models/movie-model';
import { MediaTypeModel } from '../../models/media-type.enum';
import { ProgressStateMedia } from '../../models/progress-state-media.enum';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private readonly apiUrlMovie = `${environment.apiUrlMovie}`;
  private readonly urlResearchMovie: string = 'research';
  private readonly urlRandomMovie: string = 'random-movie';
  private readonly urlWatchProgress: string = 'watchProgress';

  constructor(private http: HttpClient,
    private verifTimerShowService: VerifTimerShowService) { }

  public fetchMovieById(id: number): Observable<MovieModel> {
    return this.http.get<any>(`${this.apiUrlMovie}/${id}`).pipe(
      map((data: any) => {
        const movie: MovieModel = this.createNewMovie(data);
        return movie;
      }),
      catchError((error) => {
        const movie: MovieModel = {
          id: 0,
          title: "ChocoPlus",
          mediaLibraryId: 'undefined',
          typeZoomX: undefined,
          typeZoomY: false,
          duration: 0,
          resolution: 'any quality',
          watchProgress: 0,
          stateProgress: ProgressStateMedia.NOT_WATCHED,
          mediaType: MediaTypeModel.MOVIE,
          isRecent: false
        }
        return of(movie);
      })
    );
  }

  public createNewMovie(movie: any): MovieModel {
    const movieTmp: MovieModel = {
      id: movie.id,
      title: movie.title,
      mediaLibraryId: movie.mediaLibraryId,
      otherTitles: movie.otherTitles || [],
      startShow: this.verifTimerShowService.getGoodFormat(movie.startShow) || '00:20:00',
      endShow: this.verifTimerShowService.getGoodFormat(movie.endShow) || '00:21:30',
      duration: movie.duration ? parseInt(movie.duration) : 0,
      watchProgress: movie.watchProgress ?? 0,
      stateProgress: movie.stateProgress ?? ProgressStateMedia.NOT_WATCHED,
      resolution: movie.resolution || "any quality",
      date: new Date(movie.date) || undefined,
      credits: movie.credits || [],
      categories: movie.categories || [],
      keyWords: movie.keyWords || undefined,
      description: movie.description || undefined,
      srcPosterNormal: movie.srcPoster.normal.length <= 0 ? undefined : movie.srcPoster.normal,
      srcPosterSpecial: movie.srcPoster.special.length <= 0 ? undefined : movie.srcPoster.special,
      srcPosterLicense: movie.srcPoster.license.length <= 0 ? undefined : movie.srcPoster.license,
      srcPosterHorizontal: movie.srcPoster.horizontal.length <= 0 ? undefined : movie.srcPoster.horizontal,
      srcLogo: movie.srcLogo ? movie.srcLogo || undefined : undefined,
      srcBackgroundImage: movie.srcBackgroundImage ? movie.srcBackgroundImage || undefined : undefined,
      typeZoomX: undefined,
      typeZoomY: false,
      mediaType: MediaTypeModel.MOVIE,
      isRecent: movie.isRecent
    }
    if (movie.path) {
      movieTmp.tmdbId = movie.tmdbId;
      movieTmp.path = movie.path;
      movieTmp.frames = movie.frames;
      movieTmp.bytes = movie.bytes;
      movieTmp.height = movie.height;
      movieTmp.width = movie.width;
    }
    return movieTmp;
  }

  public fetchMovieWanted(keyWord: string): Observable<MovieModel[]> {
    return this.http.get<any[]>(`${this.apiUrlMovie}/${this.urlResearchMovie}/${keyWord}`).pipe(
      map((data: any) => {
        const movieWanted: MovieModel[] = [];
        data.forEach((movie: any) => {
          movieWanted.push(this.createNewMovie(movie));
        });
        return movieWanted;
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  public fetchRandomMovie(): Observable<MovieModel | undefined> {
    return this.http.get<any>(`${this.apiUrlMovie}/${this.urlRandomMovie}`).pipe(
      map((data: any) => {
        return this.createNewMovie(data);
      }),
      catchError((error) => {
        return of(undefined);
      })
    )
  }

  public fetchGetWatchProgressForMovie(movieId: number): Observable<{ watchProgress: number, state: ProgressStateMedia}> {
    return this.http.get<any>(`${this.apiUrlMovie}/${this.urlWatchProgress}/${movieId}`).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

}
