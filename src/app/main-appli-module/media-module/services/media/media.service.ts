import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MovieService } from '../movie/movie.service';
import { SeriesService } from '../series/series.service';
import { environment } from '../../../../../environments/environment';
import { catchError, Observable, of, map } from 'rxjs';
import { MediaModel } from '../../models/media.interface';
import { MediaTypeModel } from '../../models/media-type.enum';
import { SortCatalog } from '../../models/catalog/sort-catalog.enum';
import { FILTERS } from '../../models/catalog/filters.interface';
import { ResultCatalog } from '../../models/catalog/result-catalog.interface';
import { MediaInfoModel } from '../../models/media-info.interface';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private apiUrlMedia: string = `${environment.apiUrlMedia}`;
  private readonly apiUrlMediaInfo: string = 'media-info';
  private urlResearch: string = 'research';
  private urlCatalog: string = 'catalog';

  constructor(private readonly http: HttpClient,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService
  ) { }

  public fetchMediaById(mediaId: number): Observable<MediaModel | null> {
    return this.http.get<any>(`${this.apiUrlMedia}/${mediaId}`).pipe(
      map((media: MediaModel) => {
        if (media.mediaType === MediaTypeModel.MOVIE) {
          return this.movieService.createNewMovie(media);
        } else if (media.mediaType === MediaTypeModel.SERIES) {
          return this.seriesService.createNewSeries(media);
        }
        return null;
      }),
      catchError(() => {
        return of(null)
      })
    )
  }

  public fetchResearchMediaByKeyword(keyword: string): Observable<MediaModel[]> {
    return this.http.get<any[]>(`${this.apiUrlMedia}/${this.urlResearch}/${keyword}`).pipe(
      map((data: MediaModel[]) => {
        const medias: MediaModel[] = [];
        data.forEach((media: MediaModel) => {
          if (media.mediaType === MediaTypeModel.MOVIE) {
            medias.push(this.movieService.createNewMovie(media));
          } else if (media.mediaType === MediaTypeModel.SERIES) {
            medias.push(this.seriesService.createNewSeries(media));
          }
        });
        return medias;
      }),
      catchError(() => {
        return of([]);
      })
    )
  }

  public fetchMediaByCatalogFilters(filters: FILTERS[], sortFilter: SortCatalog, orderDirection: boolean, count: number, offset: number, userId: number = 0): Observable<ResultCatalog> {
    let params = new HttpParams()
      .set('sortFilter', sortFilter)
      .set('orderDirection', String(orderDirection))
      .set('count', String(count))
      .set('offset', String(offset))
      .set('userId', String(userId));

    return this.http.post<any>(`${this.apiUrlMedia}/${this.urlCatalog}`, filters, { params }).pipe(
      map((data: ResultCatalog) => {
        const medias: MediaModel[] = [];
        data.medias.forEach((media: MediaModel) => {
          if (media.mediaType === MediaTypeModel.MOVIE) {
            medias.push(this.movieService.createNewMovie(media));
          } else if (media.mediaType === MediaTypeModel.SERIES) {
            medias.push(this.seriesService.createNewSeries(media));
          }
        });
        return {
          medias: medias,
          total: data.total
        };
      }),
      catchError(() => of({
        medias: [],
        total: 0
      }))
    );
  }

  public fetchGetMediaInfoById(mediaId: number): Observable<MediaInfoModel | null> {
    return this.http.get<any>(`${this.apiUrlMedia}/${this.apiUrlMediaInfo}/${mediaId}`).pipe(
      map((data: any) => {
        if (!data.id) return null;
        const mediaInfo: MediaInfoModel = {
          id: data.id,
          casts: data.casts ?? [],
          crews: data.crews ?? [],
          categories: data.categories ?? [],
          keyWords: data.keyWords ?? []
        };
        return mediaInfo;
      }),
      catchError(() => of(null))
    );
  }

}
