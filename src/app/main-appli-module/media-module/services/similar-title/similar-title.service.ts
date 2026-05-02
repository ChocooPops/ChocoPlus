import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MovieService } from '../movie/movie.service';
import { map, Observable, of } from 'rxjs';
import { MediaModel } from '../../models/media.interface';
import { MediaTypeModel } from '../../models/media-type.enum';
import { SeriesService } from '../series/series.service';

@Injectable({
  providedIn: 'root'
})
export class SimilarTitleService {

  private readonly LIMIT_CACHE: number = 15;
  private readonly apiUrlSimilarTitle: string = `${environment.apiUrlSimilarTitle}`;
  private similarMediaMap: Map<number, MediaModel[]> = new Map();

  constructor(private readonly http: HttpClient,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService
  ) { }

  public fetchSimilarTitlesForOneMovieById(idMedia: number): Observable<MediaModel[]> {
    const cached: MediaModel[] | undefined = this.similarMediaMap.get(idMedia);
    if (cached) {
      return of(cached);
    }
    
    return this.http.get<any[]>(`${this.apiUrlSimilarTitle}/${idMedia}`).pipe(
      map((data: any[]) => {
        const medias: MediaModel[] = []
        data.forEach((media: MediaModel) => {
          if (media.mediaType === MediaTypeModel.MOVIE) {
            medias.push(this.movieService.createNewMovie(media));
          } else if (media.mediaType === MediaTypeModel.SERIES) {
            medias.push(this.seriesService.createNewSeries(media));
          }
        })
        this.similarMediaMap.set(idMedia, medias);
        if (this.similarMediaMap.size > this.LIMIT_CACHE) {
          this.deleteFirstKey();
        }
        return medias;
      })
    )
  }

  private deleteFirstKey(): void {
    const firstKey = this.similarMediaMap.keys().next().value;
    if (firstKey) {
      this.similarMediaMap.delete(firstKey);
    }
  }

}
