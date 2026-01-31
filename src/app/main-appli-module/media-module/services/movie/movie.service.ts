import { Injectable, Injector } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, catchError } from 'rxjs';
import { UserService } from '../../../user-module/service/user/user.service';
import { VerifTimerShowService } from '../../../common-module/services/verif-timer/verif-timer-show.service';
import { MovieModel } from '../../models/movie-model';
import { MediaTypeModel } from '../../models/media-type.enum';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private readonly apiUrlMovie = `${environment.apiUrlMovie}`;
  private readonly urlResearchMovie: string = 'research';
  private readonly urlRandomMovie: string = 'random-movie';
  private _userService?: UserService;

  constructor(private http: HttpClient,
    private verifTimerShowService: VerifTimerShowService,
    private injector: Injector) { }

  private get userService(): UserService {
    return this._userService ??= this.injector.get(UserService);
  }

  public fetchMovieById(id: number): Observable<MovieModel> {
    return this.http.get<any>(`${this.apiUrlMovie}/${id}`).pipe(
      map((data: any) => {
        const movie: MovieModel = this.createNewMovie(data);
        return movie;
      }),
      catchError((error) => {
        const movie: MovieModel = {
          id: 0,
          title: "Nameless",
          jellyfinId: 'undefined',
          typeZoomX: undefined,
          typeZoomY: false,
          isInList: false,
          mediaType: MediaTypeModel.MOVIE
        }
        return of(movie);
      })
    );
  }

  public createNewMovie(movie: any): MovieModel {
    const isInMyList = this.userService.mediaIsIntoList(movie.id, MediaTypeModel.MOVIE);
    const movieTmp: MovieModel = {
      id: movie.id,
      title: movie.title,
      jellyfinId: movie.jellyfinId,
      otherTitles: movie.otherTitles || [],
      startShow: this.verifTimerShowService.getGoodFormat(movie.startShow) || '00:20:00',
      endShow: this.verifTimerShowService.getGoodFormat(movie.endShow) || '00:21:30',
      time: movie.time ? parseInt(movie.time) : 0,
      quality: movie.quality || "any quality",
      date: new Date(movie.date) || undefined,
      directors: movie.directors || [],
      actors: movie.actors || [],
      categories: movie.categories || [],
      keyWord: movie.keyWord || undefined,
      description: movie.description || undefined,
      srcPosterNormal: movie.srcPoster.normal.length <= 0 ? undefined : movie.srcPoster.normal,
      srcPosterSpecial: movie.srcPoster.special.length <= 0 ? undefined : movie.srcPoster.special,
      srcPosterLicense: movie.srcPoster.license.length <= 0 ? undefined : movie.srcPoster.license,
      srcPosterHorizontal: movie.srcPoster.horizontal.length <= 0 ? undefined : movie.srcPoster.horizontal,
      srcLogo: movie.srcLogo ? movie.srcLogo || undefined : undefined,
      srcBackgroundImage: movie.srcBackgroundImage ? movie.srcBackgroundImage || undefined : undefined,
      typeZoomX: undefined,
      typeZoomY: false,
      isInList: isInMyList,
      mediaType: MediaTypeModel.MOVIE
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

}
