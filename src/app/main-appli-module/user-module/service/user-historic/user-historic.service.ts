import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { WatchTimeStats } from '../../dto/user-historic/watch-time-stats.interface';
import { UserCategoryPreferences } from '../../dto/user-historic/user-category-preferences.interface';
import { CategoryByTime } from '../../dto/user-historic/category-by-time';
import { CalculationMode } from '../../dto/user-historic/calculate-mode.type';
import { PeriodType } from '../../dto/user-historic/period.type';
import { ContentType } from '../../dto/user-historic/content.type';
import { WatchingStatsResponse } from '../../dto/user-historic/watching-stats-response.interface';
import { TopMediaResponse } from '../../dto/user-historic/top-media-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserHistoricService {
  private readonly apiUrlStatUser: string = `${environment.apiUrlStatUser}`;

  constructor(private http: HttpClient) {}

  private getPreferredCategories(
    userId: number,
    limit: number = 10,
  ): Observable<UserCategoryPreferences> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<any>(`${this.apiUrlStatUser}/${userId}/categories/preferences`, {
        params,
      })
      .pipe(
        map((data: UserCategoryPreferences) => {
          return data;
        }),
        catchError((error) => {
          throw error;
        }),
      );
  }

  private getPreferredCategoriesWeighted(
    userId: number,
    limit: number = 10,
  ): Observable<UserCategoryPreferences> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<any>(
        `${this.apiUrlStatUser}/${userId}/categories/preferences-weighted`,
        { params },
      )
      .pipe(
        map((data: UserCategoryPreferences) => {
          return data;
        }),
        catchError((error) => {
          throw error;
        }),
      );
  }

  private getPreferredCategoriesByTime(
    userId: number,
    limit: number = 10,
  ): Observable<CategoryByTime[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<any>(
        `${this.apiUrlStatUser}/${userId}/categories/preferences-by-time`,
        { params },
      )
      .pipe(
        map((data: CategoryByTime[]) => {
          return data;
        }),
        catchError((error) => {
          throw error;
        }),
      );
  }

  public getPreferredCategoriesByMode(
    userId: number,
    mode: CalculationMode,
    limit: number = 10,
  ): Observable<UserCategoryPreferences | CategoryByTime[]> {
    switch (mode) {
      case 'simple':
        return this.getPreferredCategories(userId ?? -1, limit);
      case 'weighted':
        return this.getPreferredCategoriesWeighted(userId ?? -1, limit);
      case 'by-time':
        return this.getPreferredCategoriesByTime(userId ?? -1, limit);
      default:
        return this.getPreferredCategories(userId ?? -1, limit);
    }
  }

  public getUserWatchTime(userId: number): Observable<WatchTimeStats> {
    return this.http
      .get<WatchTimeStats>(
        `${this.apiUrlStatUser}/users/${userId ?? -1}/watch-time`,
      )
      .pipe(
        map((data: WatchTimeStats) => {
          return data;
        }),
      );
  }

  public getUserWatchingHistory(
    userId: number,
    startDate: string,
    periodType: PeriodType = 'month',
    contentType: ContentType = 'all',
  ): Observable<WatchingStatsResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('periodType', periodType)
      .set('contentType', contentType);

    return this.http.get<WatchingStatsResponse>(
      `${this.apiUrlStatUser}/users/${userId ?? -1}/watching-history`,
      { params },
    );
  }

  public getUserTopMedia(userId: number): Observable<TopMediaResponse> {
    return this.http
      .get<TopMediaResponse>(
        `${this.apiUrlStatUser}/users/${userId ?? -1}/top-media`,
      )
      .pipe(
        map((data: TopMediaResponse) => {
          return data;
        }),
      );
  }
  
}
