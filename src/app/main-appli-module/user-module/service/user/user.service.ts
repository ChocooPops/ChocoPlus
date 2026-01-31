import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { MediaModel } from '../../../media-module/models/media.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { UserModel } from '../../dto/user.model';
import { ProfilPictureModel } from '../../dto/profil-picture.interface';
import { UpdateUserModel } from '../../dto/update-user.interface';
import { LicenseService } from '../../../license-module/service/license/licence.service';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { NewsService } from '../../../news-module/services/news/news.service';
import { MediaIdTypeModel } from '../../../media-module/models/media-id-type.interface';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { NewsVideoRunningService } from '../../../news-module/services/news-video-running/news-video-running.service';

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

  public currentUserSubject: BehaviorSubject<UserModel | undefined> = new BehaviorSubject<UserModel | undefined>(undefined);
  public currentUser$: Observable<UserModel | undefined> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService,
    private selectionService: SelectionService,
    private licenseService: LicenseService,
    private newsService: NewsService,
    private newsVideoRunningService: NewsVideoRunningService
  ) { }

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
          medias.forEach(media => {
            media.isInList = true;
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
            media.isInList = true;
            this.myListMedia.push(media);
            this.changeAllMediaList(media.id, true);
          } else {
            this.myListMedia = this.myListMedia.filter((media: MediaModel) => media.id !== media.id);
            this.changeAllMediaList(media.id, false);
          }
        }
        return data;
      })
    )
  }

  private changeAllMediaList(mediaId: number, state: boolean): void {
    this.newsVideoRunningService.changeMysList(mediaId, state);
    this.selectionService.changeMyList(mediaId, state);
    this.licenseService.changeMyList(mediaId, state);
    this.newsService.changeMyList(mediaId, state);
  }

  public mediaIsIntoList(mediaId: number, mediaType: MediaTypeModel): boolean {
    return this.myListMedia.some((media: MediaModel) => mediaId === media.id && mediaType === media.mediaType);
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
