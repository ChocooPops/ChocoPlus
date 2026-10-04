import { Injectable } from '@angular/core';
import { SelectionService } from '../../../main-appli-module/media-module/services/selection/selection.service';
import { NewsService } from '../../../main-appli-module/news-module/services/news/news.service';
import { LicenseService } from '../../../main-appli-module/license-module/service/license/licence.service';
import { catchError, defaultIfEmpty, defer, forkJoin, map, Observable, of, switchMap, take } from 'rxjs';
import { Router } from '@angular/router';
import { PageModel } from '../../models/page.enum';
import { UserService } from '../../../main-appli-module/user-module/service/user/user.service';
import { NewsVideoRunningService } from '../../../main-appli-module/news-module/services/news-video-running/news-video-running.service';

@Injectable({
  providedIn: 'root',
})
export class LoadOpeningPageService {

  private readonly lastPageVisited: string = 'LAST_PAGE_VISITED';
  private readonly openingPage: string = 'OPENING_PAGE';
  private readonly lastLicenseIdVisited: string = 'LAST_LICENSE_ID_VISITED';
  private readonly openingLicenseId: string = 'OPENING_LICENSE_ID';

  constructor(
    private selectionService: SelectionService,
    private newsService: NewsService,
    private licenseService: LicenseService,
    private userService: UserService,
    private newsVideoRunningService: NewsVideoRunningService,
    private router: Router,
  ) {}

  // ---------- STORAGE ----------

  public setLastPageVisited(page: PageModel): void {
    localStorage.setItem(this.lastPageVisited, page);
  }

  public getLastPageVisited(): PageModel {
    return this.readPage(this.lastPageVisited);
  }

  public setOpeningPage(page: PageModel): void {
    localStorage.setItem(this.openingPage, page);
  }

  public getOpeningPage(): PageModel {
    return this.readPage(this.openingPage);
  }

  public setLastLicenseIdVisited(id: number): void {
    localStorage.setItem(this.lastLicenseIdVisited, id.toString());
  }

  public getLastLicenseIdVisited(): number | null {
    return this.readId(this.lastLicenseIdVisited);
  }

  public setOpeningLicenseId(id: number): void {
    localStorage.setItem(this.openingLicenseId, id.toString());
  }

  public getOpeningLicenseId(): number | null {
    return this.readId(this.openingLicenseId);
  }

  private readPage(key: string): PageModel {
    const value: string | null = localStorage.getItem(key);
    if (value && (Object.values(PageModel) as string[]).includes(value)) {
      return value as PageModel;
    }
    localStorage.setItem(key, PageModel.PAGE_HOME);
    return PageModel.PAGE_HOME;
  }

  private readId(key: string): number | null {
    const value: string | null = localStorage.getItem(key);
    if (value === null) return null;
    const id: number = Number(value);
    return Number.isInteger(id) ? id : null;
  }

  // ---------- Chargement + navigation ----------

  private navigate(url: string): Observable<void> {
    return defer(() => {
      this.router.navigateByUrl(url);
      return of(undefined);
    });
  }

  private prefetchThenNavigate(
    source$: Observable<unknown>,
    url: string,
    fallback?: () => Observable<void>
  ): Observable<void> {
    return source$.pipe(
      take(1),
      defaultIfEmpty(null),
      map(() => true),
      catchError(() => of(false)),
      switchMap((success: boolean) =>
        !success && fallback ? fallback() : this.navigate(url)
      )
    );
  }
  
  public loadHomePageDataAndNavigate(): Observable<void> {
    return this.prefetchThenNavigate(
      forkJoin({
        selections: this.selectionService.fetchSelectionOnHomePage().pipe(take(1)),
        news: this.newsService.fetchGetAllNews().pipe(take(1)),
        licensesHome: this.licenseService.fetchAllLicenseHome().pipe(take(1)),
      }),
      'main-app'
    );
  }

  public loadResearchPageDataAndNavigate(): Observable<void> {
    return this.prefetchThenNavigate(this.licenseService.fetchAllLicenseResearch(), 'main-app/search');
  }

  public loadMoviePageDataAndNavigate(): Observable<void> {
    return this.prefetchThenNavigate(
      forkJoin({
        selections: this.selectionService.fetchRandomSelectionOnMoviePage().pipe(take(1)),
        movieShow: this.newsVideoRunningService.fetchRandomNewsMovieRunning().pipe(take(1)),
      }),
      'main-app/movies'
    );
  }

  public loadSeriesPageDataAndNavigate(): Observable<void> {
    return this.prefetchThenNavigate(
      forkJoin({
        selections: this.selectionService.fetchRandomSelectionOnSeries().pipe(take(1)),
        seriesShow: this.newsVideoRunningService.fetchRandomSeriesRunning().pipe(take(1)),
      }),
      'main-app/series'
    );
  }

  public loadMyListPageDataAndNavigate(): Observable<void> {
    return this.prefetchThenNavigate(this.userService.fetchMyMediaListByUserId(), 'main-app/my-list');
  }

  public loadLicensePageDataAndNavigate(): Observable<void> {
    const id: number | null = this.getOpeningPage() === PageModel.DEFAULT_PAGE
      ? this.getLastLicenseIdVisited()
      : this.getOpeningLicenseId();

    if (id === null) {
      return this.loadHomePageDataAndNavigate();
    }

    return this.prefetchThenNavigate(
      this.licenseService.fetchLicenseById(id),
      `main-app/license/${id}`,
      () => this.loadHomePageDataAndNavigate()
    );
  }

  public loadCatalogPageDataAndNavigate(): Observable<void> {
    return this.navigate('main-app/catalog');
  }

  public loadDownloadPageDataAndNavigate(): Observable<void> {
    return this.navigate('main-app/downloads');
  }

  public loadEditionPageDataAndNavigate(): Observable<void> {
    return this.navigate('main-app/edition');
  }

  public loadUserPageDataAndNavigate(): Observable<void> {
    return this.navigate('main-app/user/edit-profil');
  }

}
