import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MovieService } from '../movie/movie.service';
import { SeriesService } from '../series/series.service';
import { environment } from '../../../../../environments/environment';
import { catchError, Observable, of, map } from 'rxjs';
import { MediaModel } from '../../models/media.interface';
import { MediaTypeModel } from '../../models/media-type.enum';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private apiUrlMedia: string = `${environment.apiUrlMedia}`;
  private urlResearch: string = 'research';

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) { }

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

}
