import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, take, throwError } from 'rxjs';
import { JobModel } from '../../models/job.eum';
import { EditCreditModel } from '../../../edition-module/models/edit-credit.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { MediaCreditModel } from '../../models/media-credit.interface';

@Injectable({
  providedIn: 'root'
})
export class CreditService {

  private readonly apiUrlCredit: string = `${environment.apiUrlCredit}`;
  private readonly urlJobFilters: string = 'job-filters';
  private readonly urlResearch: string = 'research';
  private readonly urlAddCredit: string = 'add';
  private readonly urlModifyCredit: string = 'credit';
  private readonly urlDeleteCredit: string = 'delete';

  private currentJobFiltersSubject: BehaviorSubject<JobModel[]> = new BehaviorSubject<JobModel[]>([]);
  private currentJobFilters$: Observable<JobModel[]> = this.currentJobFiltersSubject.asObservable();

  private editCreditSubject: BehaviorSubject<EditCreditModel> = new BehaviorSubject<EditCreditModel>(this.getInitialCredit());
  private editCredit$: Observable<EditCreditModel> = this.editCreditSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.fetchAllJobFilters().pipe(take(1)).subscribe(() => {});
  }

  private fetchAllJobFilters(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCredit}/${this.urlJobFilters}`).pipe(
      map((data: JobModel[]) => {
        this.currentJobFiltersSubject.next(data);
      })
    )
  }

  public getAllJobFilters(): Observable<JobModel[]> {
    return this.currentJobFilters$;
  }

  private getInitialCredit(): EditCreditModel {
    return {
      id: -1,
      tmdbId: undefined,
      fullName: undefined,
      originalFullName: undefined,
      srcPoster: undefined
    }
  }

  public getEditCredit(): Observable<EditCreditModel> {
    return this.editCredit$;
  }

  public updateCredit(newData: Partial<EditCreditModel>): void {
    this.editCreditSubject.next({
      ...this.editCreditSubject.value,
      ...newData
    });
  }

  public modifyTmdbId(tmdbId: number): void {
    this.updateCredit({ tmdbId : tmdbId });
  }

  public modifyFullName(fullName: string): void {
    this.updateCredit({ fullName : fullName });
  }
  
  public modifyOriginalFullName(originalFullName: string): void {
    this.updateCredit({ originalFullName : originalFullName });
  }

  public modifySrcPoster(srcPoster: string | ArrayBuffer | undefined | null): void {
    this.updateCredit({ srcPoster : srcPoster });
  }

  public resetEditCredit(): void {
    this.editCreditSubject.next(this.getInitialCredit());
  }

  public setEditCreditImmediatlyByIdCredit(id: number): void {
    this.fetchCreditById(id).pipe(take(1)).subscribe((data: EditCreditModel | null) => {
      if (data) {
        this.editCreditSubject.next(data);
      }
    });
  }

  public fetchCreditById(creditId: number): Observable<EditCreditModel | null> {
    return this.http.get<any>(`${this.apiUrlCredit}/${creditId}`).pipe(
      map((data: EditCreditModel) => {
        return data;
      }),
      catchError((error) => {
        return of(null)
      })
    )
  }

  public fetchCreateNewCredit(): Observable<MessageReturnedModel> {
    return this.http.post<any>(`${this.apiUrlCredit}/${this.urlAddCredit}`, this.editCreditSubject.value).pipe(
      map((data: MessageReturnedModel) => {
        if (data.other) {
          this.fetchCreditById(data.other.id).pipe(take(1)).subscribe((data: EditCreditModel | null) => {
            if (data) {
              this.editCreditSubject.next(data);
            }
          })
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchModifyCredit(): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlCredit}/${this.urlModifyCredit}`, this.editCreditSubject.value).pipe(
      map((data: MessageReturnedModel) => {
        if (data.other) {

        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchDeleteCredit(): Observable<MessageReturnedModel> {
    return this.http.delete<any>(`${this.apiUrlCredit}/${this.urlDeleteCredit}/${this.editCreditSubject.value.id}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.resetEditCredit();
        }
        return data
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchCreditWanted(fullName: string): Observable<MediaCreditModel[]> {
    return this.http.get<any>(`${this.apiUrlCredit}/${this.urlResearch}/${fullName}`).pipe(
      map((data: MediaCreditModel[]) => {
        return data;
      })
    )
  }

}
