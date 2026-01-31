import { Injectable, Injector } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SeriesModel } from '../../models/series/series.interface';
import { UserService } from '../../../user-module/service/user/user.service';
import { MediaTypeModel } from '../../models/media-type.enum';
import { catchError, Observable, of, map } from 'rxjs';
import { EpisodeModel } from '../../models/series/episode.interface';
import { SeasonModel } from '../../models/series/season.interface';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {

  private readonly apiUrlSeries = `${environment.apiUrlSeries}`;
  private readonly urlResearchSeries: string = 'research';
  private readonly urlEpisodes: string = 'episodes';
  private readonly urlRandomSeries: string = 'random-series';
  private _userService?: UserService;

  constructor(private http: HttpClient,
    private injector: Injector
  ) { }

  private get userService(): UserService {
    return this._userService ??= this.injector.get(UserService);
  }

  public createNewSeries(series: any): SeriesModel {
    const isInMyList = this.userService.mediaIsIntoList(series.id, MediaTypeModel.SERIES);
    const seriesTmp: SeriesModel = {
      id: series.id,
      title: series.title,
      jellyfinId: series.jellyfinId,
      otherTitles: series.otherTitles || [],
      directors: series.directors || [],
      actors: series.actors || [],
      categories: series.categories || [],
      keyWord: series.keyWord || undefined,
      description: series.description || undefined,
      date: series.date ? new Date(series.date) : new Date(),
      startShow: series.startShow || '00:00:00',
      endShow: series.endShow || '00:00:00',
      srcPosterNormal: series.srcPoster.normal.length <= 0 ? undefined : series.srcPoster.normal,
      srcPosterSpecial: series.srcPoster.special.length <= 0 ? undefined : series.srcPoster.special,
      srcPosterLicense: series.srcPoster.license.length <= 0 ? undefined : series.srcPoster.license,
      srcPosterHorizontal: series.srcPoster.horizontal.length <= 0 ? undefined : series.srcPoster.horizontal,
      srcLogo: series.srcLogo ? series.srcLogo : undefined,
      srcBackgroundImage: series.srcBackgroundImage ? series.srcBackgroundImage : undefined,
      typeZoomX: undefined,
      typeZoomY: false,
      isInList: isInMyList,
      mediaType: MediaTypeModel.SERIES,
      seasons: series.seasons && series.seasons.length > 0 ? this.createNewSeasons(series.seasons) : []
    }
    return seriesTmp;
  }

  private createNewSeasons(series: SeasonModel[]): SeasonModel[] {
    return series.map((item: SeasonModel) => ({
      ...item,
      name: item.name ? item.name : `Saison ${item.seasonNumber}`,
      srcPoster: item.srcPoster ? item.srcPoster : undefined,
      isClicked: false,
      episodes: item.episodes && item.episodes.length > 0 ? this.createNewEpisodes(item.episodes) : []
    }));
  }

  private createNewEpisodes(episodes: EpisodeModel[]): EpisodeModel[] {
    return episodes.map((item: EpisodeModel) => ({
      ...item,
      name: item.name ? item.name : `Episode ${item.episodeNumber}`,
      date: item.date ? new Date(item.date) : new Date(),
      time: item.time ? item.time : 0,
      quality: item.quality ? item.quality : 'any quality',
      srcPoster: item.srcPoster ? item.srcPoster : undefined
    }))
  }

  public fetchSeasonsById(id: number): Observable<SeriesModel> {
    return this.http.get<any>(`${this.apiUrlSeries}/${id}`).pipe(
      map((data: any) => {
        const series: SeriesModel = this.createNewSeries(data);
        return series;
      }),
      catchError((error) => {
        const series: SeriesModel = {
          id: 0,
          title: "Nameless",
          jellyfinId: 'undefined',
          typeZoomX: undefined,
          typeZoomY: false,
          isInList: false,
          mediaType: MediaTypeModel.SERIES,
          seasons: []
        }
        return of(series);
      })
    );
  }

  public fetchSeriesWanted(keyWord: string): Observable<SeriesModel[]> {
    return this.http.get<any[]>(`${this.apiUrlSeries}/${this.urlResearchSeries}/${keyWord}`).pipe(
      map((data: any) => {
        const seriesWanted: SeriesModel[] = [];
        data.forEach((series: any) => {
          seriesWanted.push(this.createNewSeries(series));
        });
        return seriesWanted;
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  public fetchEpisodesBySeriesAndSeasonId(idSeries: number, idSeason: number): Observable<EpisodeModel[]> {
    return this.http.get<any[]>(`${this.apiUrlSeries}/${this.urlEpisodes}/${idSeries}/${idSeason}`).pipe(
      map((data: EpisodeModel[]) => {
        return this.createNewEpisodes(data);
      }),
      catchError(() => {
        return of([]);
      })
    )
  }

  public fetchRandomSeries(): Observable<SeriesModel | undefined> {
    return this.http.get<any>(`${this.apiUrlSeries}/${this.urlRandomSeries}`).pipe(
      map((data: any) => {
        return this.createNewSeries(data);
      }),
      catchError((error) => {
        return of(undefined);
      })
    )
  }

}
