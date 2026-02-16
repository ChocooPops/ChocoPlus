import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { WatchTimeStats } from '../../dto/user-historic/watch-time-stats.interface';
import { UserCategoryPreferences } from '../../dto/user-historic/user-category-preferences.interface';
import { CategoryByTime } from '../../dto/user-historic/category-by-time';
import { CalculationMode } from '../../dto/user-historic/calculate-mode.type';

@Injectable({
  providedIn: 'root',
})
export class UserHistoricService {
  private readonly apiUrlStatUser: string = `${environment.apiUrlStatUser}`;
  private preferredCategories: UserCategoryPreferences | undefined = undefined;
  private preferredCategoriesWeighted: UserCategoryPreferences | undefined =
    undefined;
  private preferredCategoriesByTime: CategoryByTime[] | undefined = undefined;
  private userWatchTime: WatchTimeStats | undefined;

  constructor(private http: HttpClient) {}

  private getPreferredCategories(
    userId: number,
    limit: number = 10,
  ): Observable<UserCategoryPreferences> {
    if (this.preferredCategories) {
      return of(this.preferredCategories);
    } else {
      const params = new HttpParams().set('limit', limit.toString());
      return this.http
        .get<any>(`${this.apiUrlStatUser}/${userId}/categories/preferences`, {
          params,
        })
        .pipe(
          map((data: UserCategoryPreferences) => {
            this.preferredCategories = data;
            return this.preferredCategories;
          }),
          catchError((error) => {
            throw error;
          }),
        );
    }
  }

  private getPreferredCategoriesWeighted(
    userId: number,
    limit: number = 10,
  ): Observable<UserCategoryPreferences> {
    if (this.preferredCategoriesWeighted) {
      return of(this.preferredCategoriesWeighted);
    } else {
      const params = new HttpParams().set('limit', limit.toString());
      return this.http
        .get<any>(
          `${this.apiUrlStatUser}/${userId}/categories/preferences-weighted`,
          { params },
        )
        .pipe(
          map((data: UserCategoryPreferences) => {
            this.preferredCategoriesWeighted = data;
            return this.preferredCategoriesWeighted;
          }),
          catchError((error) => {
            throw error;
          }),
        );
    }
  }

  private getPreferredCategoriesByTime(
    userId: number,
    limit: number = 10,
  ): Observable<CategoryByTime[]> {
    if (this.preferredCategoriesByTime) {
      return of(this.preferredCategoriesByTime);
    } else {
      const params = new HttpParams().set('limit', limit.toString());
      return this.http
        .get<any>(
          `${this.apiUrlStatUser}/${userId}/categories/preferences-by-time`,
          { params },
        )
        .pipe(
          map((data: CategoryByTime[]) => {
            this.preferredCategoriesByTime = data;
            return this.preferredCategoriesByTime;
          }),
          catchError((error) => {
            throw error;
          }),
        );
    }
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

  public resetAllPreferredCategories(): void {
    this.preferredCategories = undefined;
    this.preferredCategoriesByTime = undefined;
    this.preferredCategoriesWeighted = undefined;
  }

  public getUserWatchTime(userId: number): Observable<WatchTimeStats> {
    if (this.userWatchTime) {
      return of(this.userWatchTime);
    } else {
      return this.http
        .get<WatchTimeStats>(
          `${this.apiUrlStatUser}/users/${userId ?? -1}/watch-time`,
        )
        .pipe(
          map((data: WatchTimeStats) => {
            this.userWatchTime = data;
            return this.userWatchTime;
          }),
        );
    }
  }

  public resetUserWatchTime(): void {
    this.userWatchTime = undefined;
  }

}
