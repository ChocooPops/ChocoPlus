import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminParamsService {

  private readonly apiUrlSimilarTitle: string = `${environment.apiUrlSimilarTitle}`;
  private readonly apiUrlProfilPhoto: string = `${environment.apiProfilPicture}`;
  private readonly apiUrlCredit: string = `${environment.apiUrlCredit}`;
  private readonly urlRewriteAllSimilarTitle: string = 'rewrite-all-data';
  private readonly urlSaveAllNewCredit: string = 'save-all-new-credit';

  constructor(private readonly http: HttpClient) { }

  public fetchResetAllSimilarTitles(): Observable<any> {
    return this.http.put<any>(`${this.apiUrlSimilarTitle}/${this.urlRewriteAllSimilarTitle}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchReloadAllProfilPhoto(): Observable<any> {
    return this.http.post<any>(`${this.apiUrlProfilPhoto}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }

  public fetchSaveAllNewCredit(): Observable<any> {
    return this.http.post<any>(`${this.apiUrlCredit}/${this.urlSaveAllNewCredit}`, null).pipe(
      map((data: any) => {
        return data;
      })
    )
  }


}
