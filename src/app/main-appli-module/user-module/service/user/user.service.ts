import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, Subject } from 'rxjs';
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
  
  private myListMedia: MediaModel[] = [];
  private myListChangedSubject = new Subject<number>();
  private myListChanged$ = this.myListChangedSubject.asObservable();

  public currentUserSubject: BehaviorSubject<UserModel | undefined> = new BehaviorSubject<UserModel | undefined>(undefined);
  public currentUser$: Observable<UserModel | undefined> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) { }

  public getMyListChanged(): Observable<number> {
    return this.myListChanged$;
  }

  public getCurrentUserValue(): UserModel | undefined {
    return this.currentUserSubject.value;
  }

  public getCurrentUser(): Observable<UserModel | undefined> {
    return this.currentUser$;
  }

  public resetCurrentUser(): void {
    this.currentUserSubject.next(undefined);
  }

  public fetchCurrentUser(): Observable<UserModel> {
    return this.http.get<any>(`${this.apiUrlUser}/${this.urlCurrentUser}`).pipe(
      map((data: UserModel) => {
        data.dateBorn = new Date(data.dateBorn);
        data.createdAt = new Date(data.createdAt);
        this.currentUserSubject.next(data);
        return data;
      })
    )
  }

  public fetchMyMediaListByUserId(): Observable<MediaModel[]> {
    if (this.myListMedia.length > 0) {
      return of(this.myListMedia)
    } else {
      return this.http.get<any>(`${this.apiUrlUser}/${this.urlGetMyList}`).pipe(
        map((data: any) => {
          const medias: MediaModel[] = [];
          data.forEach((media: MediaModel) => {
            if (media.mediaType === MediaTypeModel.MOVIE) {
              medias.push(this.movieService.createNewMovie(media));
            } else if (media.mediaType === MediaTypeModel.SERIES) {
              medias.push(this.seriesService.createNewSeries(media));
            }
          });
          this.myListMedia = medias;
          return this.myListMedia;
        })
      )
    }
  }

  public fetchToggleMediaIntoList(media: MediaModel): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlUser}/${this.urlToggleIntoMyList}/${media.id}`, null).pipe(
      map((data: MessageReturnedModel) => {
        if (data && data.id >= 0) {
          if (data.state) {
            this.myListMedia.push(media);
          } else {
            this.myListMedia = this.myListMedia.filter((m: MediaModel) => m.id !== media.id);
          }
          this.myListChangedSubject.next(media.id);
        }
        return data;
      })
    )
  }

  public mediaIsIntoList(mediaId: number): boolean {
    return this.myListMedia.some((media: MediaModel) => mediaId === media.id);
  }

  private isChangeProfilPictureActivate: boolean = true;

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
      )
    } else {
      return of(null);
    }
  }

  public fetchUpdateUserByUser(update: UpdateUserModel): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlUser}/${this.urlUpdateUserByUser}`, update).pipe(
      map((data: MessageReturnedModel) => {
        return data;
      }),
      catchError((error) => {
        return of({
          id: -1,
          state: false,
          message: "Erreur avec le serveur"
        })
      })
    )
  }

  public fetchDeleteUserByUser(): Observable<MessageReturnedModel> {
    return this.http.delete<any>(`${this.apiUrlUser}`).pipe(
      map((data: MessageReturnedModel) => {
        return data;
      }),
      catchError((error) => {
        return of({
          id: -1,
          state: false,
          message: "Erreur avec le serveur"
        })
      })
    )
  }

}
