import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, map, Observable, take } from 'rxjs';
import { JobModel } from '../../models/job.eum';

@Injectable({
  providedIn: 'root'
})
export class CreditService {

  private readonly apiUrlCredit: string = `${environment.apiUrlCredit}`;
  private readonly urlJobFilters: string = 'job-filters';

  private currentJobFiltersSubject: BehaviorSubject<JobModel[]> = new BehaviorSubject<JobModel[]>([]);
  private currentJobFilters$: Observable<JobModel[]> = this.currentJobFiltersSubject.asObservable();

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

}
