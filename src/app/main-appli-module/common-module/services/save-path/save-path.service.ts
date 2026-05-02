import { Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SavePathService {

  private history: string[] = [];
  private currentIndex = -1;
  private pendingIndexChange: number | null = null;

  private canGoBackSubject = new BehaviorSubject<boolean>(false);
  private canGoForwardSubject = new BehaviorSubject<boolean>(false);

  private canGoBack$ = this.canGoBackSubject.asObservable();
  private canGoForward$ = this.canGoForwardSubject.asObservable();

  private oldPath = '';
  private id: number | undefined;

  private readonly SEARCH_PATH = '/main-app/search';

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter(event =>
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ))
      .subscribe(event => {
        if (event instanceof NavigationCancel || event instanceof NavigationError) {
          this.pendingIndexChange = null;
          this.updateStates();
          return;
        }

        if (!(event instanceof NavigationEnd)) return;

        const url = event.urlAfterRedirects;

        if (this.pendingIndexChange !== null) {
          this.currentIndex = this.pendingIndexChange;
          this.pendingIndexChange = null;
        } else if (this.history[this.currentIndex] !== url) {
          this.history = this.history.slice(0, this.currentIndex + 1);

          const isSearchUrl = url.startsWith(this.SEARCH_PATH);
          const previousUrl = this.history[this.currentIndex];
          const previousIsSearchUrl = previousUrl?.startsWith(this.SEARCH_PATH);

          if (isSearchUrl && previousIsSearchUrl) {
            this.history[this.currentIndex] = url;
          } else {
            this.history.push(url);
            this.currentIndex = this.history.length - 1;
          }
        }

        this.updateStates();
      });
  }

  public getCanGoBack(): Observable<boolean> {
    return this.canGoBack$;
  }

  public getCanGoForward(): Observable<boolean> {
    return this.canGoForward$;
  }

  back(): void {
    if (!this.canGoBack()) return;
    this.pendingIndexChange = this.currentIndex - 1;
    this.router.navigateByUrl(this.history[this.pendingIndexChange]);
  }

  forward(): void {
    if (!this.canGoForward()) return;
    this.pendingIndexChange = this.currentIndex + 1;
    this.router.navigateByUrl(this.history[this.pendingIndexChange]);
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  setActualPath(path: string): void {
    this.oldPath = path;
  }

  setActualId(id: number | undefined): void {
    this.id = id;
  }

  navigateToOldPath(): void {
    if (!this.oldPath) return;
    this.id === undefined
      ? this.router.navigateByUrl(this.oldPath)
      : this.router.navigate([this.oldPath, this.id]);
  }

  private updateStates(): void {
    this.canGoBackSubject.next(this.canGoBack());
    this.canGoForwardSubject.next(this.canGoForward());
  }
}