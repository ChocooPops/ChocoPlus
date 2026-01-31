import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerJellyfinService {

  private readonly apiUrlJellyfin: string = `${environment.apiJellyfin}`;
  private readonly apiUrlSimilarTitle: string = `${environment.apiUrlSimilarTitle}`;
  private readonly apiUrlProfilPhoto: string = `${environment.apiProfilPicture}`;
  private readonly urlRewriteAllSimilarTitle: string = 'rewrite-all-data';
  private readonly urlResetJellyfinItemsMovie: string = 'reset-jellyfin-items-movie';
  private readonly urlResetJellyfinItemsSeries: string = 'reset-jellyfin-items-series';
  private readonly urlResetAllMovie: string = 'reset-all-movies';
  private readonly urlResetAllSeries: string = 'reset-all-series';
  private readonly urlSaveMovieDontSaved: string = 'save-movie-dont-saved';
  private readonly urlSaveSeriesDontSaved: string = 'save-series-dont-saved';

  constructor(private http: HttpClient) { }

  public fetchResetJallyfinItemsMovie(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlJellyfin}/${this.urlResetJellyfinItemsMovie}`).pipe(
      map((data: any) => {
        return data;
      })
    )
  }
  public fetchResetJallyfinItemsSeries(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlJellyfin}/${this.urlResetJellyfinItemsSeries}`).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchResetAllMovieData(): Observable<any> {
    return this.http.put<any>(`${this.apiUrlJellyfin}/${this.urlResetAllMovie}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }
  public fetchResetAllSeriesData(): Observable<any> {
    return this.http.put<any>(`${this.apiUrlJellyfin}/${this.urlResetAllSeries}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchSaveMovieDontSaved(): Observable<any> {
    return this.http.post<any>(`${this.apiUrlJellyfin}/${this.urlSaveMovieDontSaved}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }
  public fetchSaveSeriesDontSaved(): Observable<any> {
    return this.http.post<any>(`${this.apiUrlJellyfin}/${this.urlSaveSeriesDontSaved}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchResetAllSimilarTitles(): Observable<any> {
    return this.http.put<any>(`${this.apiUrlSimilarTitle}/${this.urlRewriteAllSimilarTitle}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchReloadAllProfilPhot(): Observable<any> {
    return this.http.post<any>(`${this.apiUrlProfilPhoto}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

}
