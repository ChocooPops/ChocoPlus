import { Injectable } from '@angular/core';
import { SelectionModel } from '../../models/selection.interface';
import { MediaModel } from '../../models/media.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SelectionType } from '../../models/selection-type.enum';
import { MovieService } from '../movie/movie.service';
import { MediaTypeModel } from '../../models/media-type.enum';
import { SeriesService } from '../series/series.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {

  private readonly apiUrlSelection = `${environment.apiUrlSelection}`;
  private readonly urlRandomSelectionHome: string = 'selection-home';
  private readonly urlRandomMediaSelectionByType: string = 'random-media-selection-by-type';
  private readonly urlResearchSelection: string = 'research';

  selectionOnHomePage: SelectionModel[] = [];
  selectionOnMoviePage: SelectionModel[] = [];
  selectionOnSeriesPage: SelectionModel[] = [];

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) { }

  public createNewSelection(id: number, name: string, typeSelection: SelectionType, medias: MediaModel[]): SelectionModel {
    return {
      id: id,
      name: name,
      typeSelection: typeSelection,
      mediaList: medias
    }
  }

  public createNewSelectionByFetch(data: any): SelectionModel {
    const medias: MediaModel[] = [];
    data.mediaList.forEach((media: MediaModel) => {
      if (!media || !media.title) {
        console.warn('Invalid movie structure:', media);
        return;
      }
      if (media.mediaType === MediaTypeModel.MOVIE) {
        const mediaTmp: MediaModel = this.movieService.createNewMovie(media);
        medias.push(mediaTmp);
      } else if (media.mediaType === MediaTypeModel.SERIES) {
        const mediaTmp: MediaModel = this.seriesService.createNewSeries(media);
        medias.push(mediaTmp);
      }
    });
    const type = data.selectionType;
    const mediaSelection: SelectionModel = {
      id: data.id,
      typeSelection: type,
      name: data.name,
      mediaList: medias
    }
    return mediaSelection;
  }

  public fetchSelectionOnHomePage(): Observable<SelectionModel[]> {
    if (this.selectionOnHomePage.length <= 0) {
      return this.http.get<any[]>(`${this.apiUrlSelection}/${this.urlRandomSelectionHome}`).pipe(
        map((data) => {
          const selections: SelectionModel[] = [];
          data.forEach((mediaSelection) => {
            selections.push(this.createNewSelectionByFetch(mediaSelection));
          });
          return this.selectionOnHomePage = selections;
        }),
        catchError((error) => {
          return of([])
        })
      );
    } else {
      return of(this.selectionOnHomePage);
    }
  }

  fetchRandomSelectionOnMoviePage(): Observable<SelectionModel[]> {
    if (this.selectionOnMoviePage.length <= 0) {
      return this.http.get<any[]>(`${this.apiUrlSelection}/${this.urlRandomMediaSelectionByType}/${MediaTypeModel.MOVIE}`).pipe(
        map((data) => {
          const selections: SelectionModel[] = [];
          data.forEach((mediaSelection) => {
            selections.push(this.createNewSelectionByFetch(mediaSelection));
          });
          return this.selectionOnMoviePage = selections;
        }),
        catchError((error) => {
          return of([])
        })
      );
    } else {
      return of(this.selectionOnMoviePage);
    }
  }

  fetchRandomSelectionOnSeries(): Observable<SelectionModel[]> {
    if (this.selectionOnSeriesPage.length <= 0) {
      return this.http.get<any[]>(`${this.apiUrlSelection}/${this.urlRandomMediaSelectionByType}/${MediaTypeModel.SERIES}`).pipe(
        map((data) => {
          const selections: SelectionModel[] = [];
          data.forEach((mediaSelection) => {
            selections.push(this.createNewSelectionByFetch(mediaSelection));
          });
          return this.selectionOnSeriesPage = selections;
        }),
        catchError((error) => {
          return of([])
        })
      );
    } else {
      return of(this.selectionOnSeriesPage);
    }
  }


  fetchSelectionWanted(keyWord: String): Observable<SelectionModel[]> {
    return this.http.get<any[]>(`${this.apiUrlSelection}/${this.urlResearchSelection}/${keyWord}`).pipe(
      map((data: any) => {
        const mediaSelectionWanted: SelectionModel[] = [];
        data.forEach((mediaSelection: any) => {
          mediaSelectionWanted.push(this.createNewSelectionByFetch(mediaSelection));
        });
        return mediaSelectionWanted;
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  fetchSelectionById(id: number): Observable<SelectionModel> {
    return this.http.get<any>(`${this.apiUrlSelection}/${id}`).pipe(
      map((data: any) => {
        const mediaSelection: SelectionModel = this.createNewSelectionByFetch(data);
        return mediaSelection;
      }),
      catchError((error) => {
        const mediaSelection: SelectionModel = {
          id: 0,
          typeSelection: SelectionType.NORMAL_POSTER,
          name: 'Nameless',
          mediaList: []
        }
        return of(mediaSelection);
      })
    )
  }

  public changeMyList(mediaId: number, state: boolean): void {
    this.selectionOnHomePage.some((selection: SelectionModel) =>
      selection.mediaList.some((media: MediaModel) => {
        if (media.id === mediaId) {
          media.isInList = state;
          return;
        }
      })
    );
    this.selectionOnMoviePage.some((selection: SelectionModel) =>
      selection.mediaList.some((media: MediaModel) => {
        if (media.id === mediaId) {
          media.isInList = state;
          return;
        }
      })
    );
    this.selectionOnSeriesPage.some((selection: SelectionModel) =>
      selection.mediaList.some((media: MediaModel) => {
        if (media.id === mediaId) {
          media.isInList = state;
          return;
        }
      })
    );
  }

  public resetSelectionHome(): void {
    this.selectionOnHomePage = [];
  }

}
