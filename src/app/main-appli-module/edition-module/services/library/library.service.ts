import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, take } from 'rxjs';
import { Library } from '../../models/library/library.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { MediaLibrary } from '../../models/library/media-library.interface';
import { StateLibrary } from '../../models/library/state-library.enum';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private readonly apiUrlLibrary: string = `${environment.apiUrlLibrary}`;
  
  private librariesSubject: BehaviorSubject<Library[]> = new BehaviorSubject<Library[]>([]);
  private libraries$: Observable<Library[]> = this.librariesSubject.asObservable();

  constructor(private readonly http: HttpClient) { }

  public getLibrary(): Observable<Library[]> {
    return this.libraries$;
  }

  public fetchCreateNewLibrary(library: Library): Observable<MessageReturnedModel> {
    return this.http.post<any>(`${this.apiUrlLibrary}`, library).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other && data.other.id && data.other.mediaType) {
          const library: Library = data.other;
          const libraries: Library[] = this.librariesSubject.value;
          libraries.push(data.other);
          this.librariesSubject.next(libraries);
          this.callFetchRefreshLibrary(library.id, library.mediaType);
        }
        return data;
      })
    )
  }

  public fetchDeleteLibrary(id: string): Observable<MessageReturnedModel> {
    return this.http.delete<any>(`${this.apiUrlLibrary}/${id}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          const libraries: Library[] = this.librariesSubject.value.filter((item) => item.id !== id);
          this.librariesSubject.next(libraries);
        }
        return data;
      })
    )
  }

  public fetchAllLibrary(): Observable<Library[]> {
    if (this.librariesSubject.value.length <= 0) { 
      return this.http.get<any>(`${this.apiUrlLibrary}/libraries`).pipe(
        map((item: Library[]) => {
          this.librariesSubject.next(item);
          return item;
        }),
        catchError((error) => {
          return of([])
        })
      )
    } else {
      return of(this.librariesSubject.value);
    }
  }

  public fetchAllMediaLibraryByLibraryId(libraryId: string): Observable<MediaLibrary[]> {
    return this.http.get<any>(`${this.apiUrlLibrary}/media-libraries/${libraryId}`).pipe(
      map((data: MediaLibrary[]) => {
        return data;
      }),
      catchError((error) => {
        return of([]);
      })
    )
  }
  
  public callFetchRefreshLibrary(id: string, mediaType: MediaTypeModel): void {
    this.modifyStateLibrary(id, StateLibrary.IN_PROGRESS, null);
    this.fetchRefreshLibrary(id, mediaType).pipe(take(1)).subscribe({
      next: ((data) => {
        this.modifyStateLibrary(id, StateLibrary.NOT_WORKED, data);
      }),
      error: (() => {
        this.modifyStateLibrary(id, StateLibrary.NOT_WORKED, null);
      })
    });
  }

  private fetchRefreshLibrary(id: string, mediaType: MediaTypeModel): Observable<any> {
    return this.http.put<any>(`${this.apiUrlLibrary}/refresh/${id}/${mediaType}`, null).pipe(
      map((data) => {
        return data;
      })
    );
  }

  private modifyStateLibrary(id: string, state: StateLibrary, data: any): void {
    const libraries: Library[] = this.librariesSubject.value;
    const index: number = libraries.findIndex((item) => item.id === id);
    if (index >= 0) {
      libraries[index].state = state;
      if (data) libraries[index].log = data;
    }
  }

  public resetLibrary(): void {
    this.librariesSubject.next([]);
  }

}
