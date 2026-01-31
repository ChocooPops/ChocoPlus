import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MovieService } from '../movie/movie.service';
import { map, Observable } from 'rxjs';
import { MediaModel } from '../../models/media.interface';
import { MediaTypeModel } from '../../models/media-type.enum';
import { SeriesService } from '../series/series.service';

@Injectable({
  providedIn: 'root'
})
export class SimilarTitleService {

  private apiUrlSimilarTitle: string = `${environment.apiUrlSimilarTitle}`;

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) { }

  public fetchSimilarTitlesForOneMovieById(idMedia: number): Observable<MediaModel[]> {
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
        return medias;
      })
    )
  }

}
