import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, Subject, tap } from 'rxjs';
import { MediaModel } from '../../../media-module/models/media.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { UserModel } from '../../dto/user.model';
import { ProfilPictureModel } from '../../dto/profil-picture.interface';
import { UpdateUserModel } from '../../dto/update-user.interface';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { SeriesService } from '../../../media-module/services/series/series.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrlUser: string = `${environment.apiUrlUser}`;
  private readonly urlGetMyList: string = 'my-list';
  private readonly urlCurrentUser: string = 'current-user';
  private readonly urlToggleIntoMyList: string = 'toggle-into-my-list';
  private readonly urlUpdateProfilPicture: string = 'profil-picture';
  private readonly urlUpdateUserByUser: string = 'update-user-by-user';

  private readonly myListMediaSubject = new BehaviorSubject<Map<number, MediaModel>>(new Map());
  private readonly myListMedia$: Observable<MediaModel[]> = this.myListMediaSubject.pipe(
    map((medias: Map<number, MediaModel>) => Array.from(medias.values()))
  );

  private myListChangedSubject = new Subject<number>();
  private myListChanged$ = this.myListChangedSubject.asObservable();

  public currentUserSubject: BehaviorSubject<UserModel | undefined> = new BehaviorSubject<UserModel | undefined>(undefined);
  public currentUser$: Observable<UserModel | undefined> = this.currentUserSubject.asObservable();

  private isChangeProfilPictureActivate: boolean = true;

  constructor(
    private readonly http: HttpClient,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService
  ) { }

  // ==================== Utilisateur courant ====================

  public getCurrentUserValue(): UserModel | undefined {
    return this.currentUserSubject.value;
  }

  public getCurrentUser(): Observable<UserModel | undefined> {
    return this.currentUser$;
  }

  public resetCurrentUser(): void {
    this.currentUserSubject.next(undefined);
    this.resetMyList();
  }

  public fetchCurrentUser(): Observable<UserModel> {
    if (this.currentUserSubject.value) return of(this.currentUserSubject.value);
    return this.http.get<any>(`${this.apiUrlUser}/${this.urlCurrentUser}`).pipe(
      map((data: UserModel) => {
        data.dateBorn = new Date(data.dateBorn);
        data.createdAt = new Date(data.createdAt);
        this.currentUserSubject.next(data);
        return data;
      })
    );
  }

  public fetchChangeProfilPicture(idProfilPicture: number): Observable<ProfilPictureModel | null> {
    if (this.isChangeProfilPictureActivate) {
      this.isChangeProfilPictureActivate = false;
      return this.http.put<any>(`${this.apiUrlUser}/${this.urlUpdateProfilPicture}/${idProfilPicture}`, null).pipe(
        map((data: ProfilPictureModel) => {
          this.isChangeProfilPictureActivate = true;
          if (data && data.name) {
            const user: UserModel | undefined = this.currentUserSubject.value;
            if (user) {
              user.profilPhoto = data.name;
              this.currentUserSubject.next(user);
            }
            return data;
          } else {
            return null;
          }
        }),
        catchError((error) => {
          this.isChangeProfilPictureActivate = true;
          return of(null);
        })
      );
    } else {
      return of(null);
    }
  }

  public fetchUpdateUserByUser(update: UpdateUserModel): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlUser}/${this.urlUpdateUserByUser}`, update).pipe(
      map((data: MessageReturnedModel) => data),
      catchError(() => of({ id: -1, state: false, message: 'Erreur avec le serveur' }))
    );
  }

  public fetchDeleteUserByUser(): Observable<MessageReturnedModel> {
    return this.http.delete<any>(`${this.apiUrlUser}`).pipe(
      map((data: MessageReturnedModel) => data),
      catchError(() => of({ id: -1, state: false, message: 'Erreur avec le serveur' }))
    );
  }

  // ==================== Ma liste ====================

  public getMyListChanged(): Observable<number> {
    return this.myListChanged$;
  }

  public getMyList(): Observable<MediaModel[]> {
    return this.myListMedia$;
  }

  public mediaIsIntoList(mediaId: number): boolean {
    return this.myListMediaSubject.value.has(mediaId);
  }

  public fetchMyMediaListByUserId(): Observable<void> {
    if (this.myListMediaSubject.value.size > 0) return of();

    return this.http.get<MediaModel[]>(`${this.apiUrlUser}/${this.urlGetMyList}`).pipe(
      map((data: MediaModel[]) => data
        .map((media: MediaModel) => this.createMedia(media))
        .filter((media): media is MediaModel => media !== null)
      ),
      tap((medias: MediaModel[]) => {
        this.myListMediaSubject.next(new Map(medias.map((media: MediaModel) => [media.id, media])));
      }),
      map(() => undefined),
      catchError(() => {
        this.myListMediaSubject.next(new Map());
        return of();
      })
    );
  }

  public fetchToggleMediaIntoList(media: MediaModel): Observable<MessageReturnedModel> {
    return this.http.put<MessageReturnedModel>(`${this.apiUrlUser}/${this.urlToggleIntoMyList}/${media.id}`, null).pipe(
      tap((data: MessageReturnedModel) => {
        if (!data || data.id < 0) return;
        if (data.state) {
          this.addMediaIntoList(media);
        } else {
          this.deleteMediaIntoList(media.id);
        }
        this.myListChangedSubject.next(media.id);
      })
    );
  }

  public addMediaIntoList(media: MediaModel): void {
    const current: Map<number, MediaModel> = this.myListMediaSubject.value;
    if (current.has(media.id)) return;
    const updated = new Map(current);
    updated.set(media.id, media);
    this.myListMediaSubject.next(updated);
  }

  public deleteMediaIntoList(mediaId: number): void {
    const current: Map<number, MediaModel> = this.myListMediaSubject.value;
    if (!current.has(mediaId)) return;
    const updated = new Map(current);
    updated.delete(mediaId);
    this.myListMediaSubject.next(updated);
  }

  private createMedia(media: MediaModel): MediaModel | null {
    switch (media.mediaType) {
      case MediaTypeModel.MOVIE:  return this.movieService.createNewMovie(media);
      case MediaTypeModel.SERIES: return this.seriesService.createNewSeries(media);
      default:                    return null;
    }
  }

  private resetMyList(): void {
    this.myListMediaSubject.next(new Map());
  }
  
}