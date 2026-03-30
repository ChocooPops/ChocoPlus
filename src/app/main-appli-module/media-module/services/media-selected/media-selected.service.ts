import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { MediaModel } from '../../models/media.interface';
import { MediaInfoModel } from '../../models/media-info.interface';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MediaSelectedService {

  private readonly apiUrlMedia: string = `${environment.apiUrlMedia}`;
  private readonly apiUrlMediaInfo: string = 'media-info';
  private mediaInfoMap: Map<number, MediaInfoModel> = new Map();

  private mediaSelectedSubject: BehaviorSubject<MediaModel | undefined> = new BehaviorSubject<MediaModel | undefined>(undefined);
  private mediaSelected$: Observable<MediaModel | undefined> = this.mediaSelectedSubject.asObservable();

  constructor(private http: HttpClient) { }

  selectMedia(media: MediaModel): void {
    this.mediaSelectedSubject.next(media);
  }
  clearSelection(): void {
    this.mediaSelectedSubject.next(undefined);
  }
  getMediaSelected(): Observable<MediaModel | undefined> {
    return this.mediaSelected$;
  }

  public fetchGetMediaInfoById(mediaId: number): Observable<MediaInfoModel | null> {
    const cached = this.mediaInfoMap.get(mediaId);
    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiUrlMedia}/${this.apiUrlMediaInfo}/${mediaId}`).pipe(
      map((data: any) => {
        if (!data.id) return null;

        const mediaInfo: MediaInfoModel = {
          id: data.id,
          actors: data.actors ?? [],
          directors: data.directors ?? [],
          categories: data.categories ?? [],
          keyWords: data.keyWords ?? []
        };

        this.mediaInfoMap.set(mediaId, mediaInfo);
        return mediaInfo;
      }),
      catchError(() => of(null))
    );
  }

}
