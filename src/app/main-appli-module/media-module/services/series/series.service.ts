import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SeriesModel } from '../../models/series/series.interface';
import { MediaTypeModel } from '../../models/media-type.enum';
import { catchError, Observable, of, map } from 'rxjs';
import { EpisodeModel } from '../../models/series/episode.interface';
import { SeasonModel } from '../../models/series/season.interface';
import { ProgressStateMedia } from '../../models/progress-state-media.enum';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {

  private readonly apiUrlSeries = `${environment.apiUrlSeries}`;
  private readonly urlResearchSeries: string = 'research';
  private readonly urlEpisodes: string = 'episodes';
  private readonly urlRandomSeries: string = 'random-series';
  private readonly urlFirstEpisode: string = 'first-episode';
  private readonly urlLastEpisodeWatched: string = 'last-episode-watched';
  private readonly urlWatchProgress: string = 'watchProgress';

  private episodeMap: Map<number, EpisodeModel[]> = new Map();

  constructor(private http: HttpClient) { }

  public createNewSeries(series: any): SeriesModel {
    const seriesTmp: SeriesModel = {
      id: series.id,
      title: series.title,
      mediaLibraryId: series.mediaLibraryId,
      otherTitles: series.otherTitles || [],
      credits: series.credits || [],
      categories: series.categories || [],
      keyWords: series.keyWords || undefined,
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
      mediaType: MediaTypeModel.SERIES,
      seasons: series.seasons && series.seasons.length > 0 ? this.createNewSeasons(series.seasons) : []
    }

    if (series.path) {
      seriesTmp.path = series.path
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
      duration: item.duration ? item.duration : 0,
      watchProgress: item.watchProgress ?? 0,
      stateProgress: item.stateProgress ?? ProgressStateMedia.NOT_WATCHED,
      resolution: item.resolution ? item.resolution : 'any quality',
      srcPoster: item.srcPoster ? item.srcPoster : undefined
    }));
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
          mediaLibraryId: 'undefined',
          typeZoomX: undefined,
          typeZoomY: false,
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
    const cached: EpisodeModel[] | undefined = this.episodeMap.get(idSeason);
    if (cached) {
      return of(cached);
    }
    return this.http.get<any[]>(`${this.apiUrlSeries}/${this.urlEpisodes}/${idSeries}/${idSeason}`).pipe(
      map((data: EpisodeModel[]) => {
        const episodes: EpisodeModel[] = this.createNewEpisodes(data);
        this.episodeMap.set(idSeason, episodes);
        return episodes;
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

  public fetchFirstEpisode(seriesId: number): Observable<EpisodeModel> {
    return this.http.get<any>(`${this.apiUrlSeries}/${this.urlFirstEpisode}/${seriesId}`).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchLastWatchedEpisode(seriesId: number): Observable<EpisodeModel> {
    return this.http.get<any>(`${this.apiUrlSeries}/${this.urlLastEpisodeWatched}/${seriesId}`).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchGetWatchProgressForEpisode(episodeId: number): Observable<{ watchProgress: number, state: ProgressStateMedia}> {
    return this.http.get<any>(`${this.apiUrlSeries}/${this.urlWatchProgress}/${episodeId}`).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

}
