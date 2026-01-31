import { Injectable } from '@angular/core';
import { SupportModel } from '../../dto/support.interface';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { FormSupportModel } from '../../dto/form-support';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  private apiSupport: string = `${environment.apiSupport}`
  private formSupport: SupportModel[] = [];

  constructor(private http: HttpClient) { }

  public fetchGetAllFormSupport(): Observable<SupportModel[]> {
    if (this.formSupport.length <= 0) {
      return this.http.get<any[]>(`${this.apiSupport}`).pipe(
        map((data: SupportModel[]) => {
          this.formSupport = data;
          return this.formSupport;
        })
      )
    } else {
      return of(this.formSupport);
    }
  }

  public fetchSendForm(form: FormSupportModel): Observable<MessageReturnedModel> {
    return this.http.post<any>(`${this.apiSupport}`, form).pipe(
      map((data: MessageReturnedModel) => {
        return data;
      }),
      catchError(() => {
        return of({
          id: -1,
          message: 'error',
          state: false
        })
      })
    )
  }

}
