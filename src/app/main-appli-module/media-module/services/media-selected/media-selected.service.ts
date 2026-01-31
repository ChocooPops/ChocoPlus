import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MediaModel } from '../../models/media.interface';

@Injectable({
  providedIn: 'root'
})
export class MediaSelectedService {

  private mediaSelectedSubject: BehaviorSubject<MediaModel | undefined> = new BehaviorSubject<MediaModel | undefined>(undefined);
  private mediaSelected$: Observable<MediaModel | undefined> = this.mediaSelectedSubject.asObservable();

  selectMedia(media: MediaModel): void {
    this.mediaSelectedSubject.next(media);
  }
  clearSelection(): void {
    this.mediaSelectedSubject.next(undefined);
  }
  getMediaSelected(): Observable<MediaModel | undefined> {
    return this.mediaSelected$;
  }

  constructor() { }

}
