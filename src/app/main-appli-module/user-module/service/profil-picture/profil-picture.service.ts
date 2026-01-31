import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ProfilPictureModel } from '../../dto/profil-picture.interface';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfilPictureService {

  private readonly apiUrlProfilPicture: string = `${environment.apiProfilPicture}`;
  private profilPictures: ProfilPictureModel[] = [];

  constructor(private http: HttpClient) { }

  public getAllProfilPicture(): Observable<ProfilPictureModel[]> {
    if (this.profilPictures.length <= 0) {
      return this.http.get<any>(`${this.apiUrlProfilPicture}`).pipe(
        map((data: ProfilPictureModel[]) => {
          this.profilPictures = data;
          return this.profilPictures;
        })
      )
    } else {
      return of(this.profilPictures);
    }
  }

}
