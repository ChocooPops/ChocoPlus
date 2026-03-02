import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SavePathService {

  private history: string[] = [];
  private currentIndex = -1;

  private isHistoryNavigation = false;

  private canGoBackSubject = new BehaviorSubject<boolean>(false);
  private canGoForwardSubject = new BehaviorSubject<boolean>(false);

  private canGoBack$ = this.canGoBackSubject.asObservable();
  private canGoForward$ = this.canGoForwardSubject.asObservable();

  private oldPath: string = "";
  private id: number | undefined = undefined;

  constructor(
    private readonly router: Router,
    private readonly location: Location
  ) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;

        // ⚠️ Si c'est un back/forward, on ne touche PAS à l'historique
        if (this.isHistoryNavigation) {
          this.isHistoryNavigation = false;
          this.updateStates();
          return;
        }

        // Navigation normale
        if (this.currentIndex === -1 || this.history[this.currentIndex] !== url) {
          // On coupe le "forward stack"
          this.history = this.history.slice(0, this.currentIndex + 1);
          this.history.push(url);
          this.currentIndex = this.history.length - 1;
        }

        this.updateStates();
      });
  }

  // ========================
  // Observables publics
  // ========================
  public getCanGoBack(): Observable<boolean> {
    return this.canGoBack$;
  }

  public getCanGoForward(): Observable<boolean> {
    return this.canGoForward$;
  }

  // ========================
  // Navigation custom
  // ========================
  public setActualPath(path: string): void {
    this.oldPath = path;
  }

  public setActualId(actualId: number | undefined): void {
    this.id = actualId;
  }

  public navigateToOldPath(): void {
    if (!this.oldPath) return;

    if (this.id === undefined) {
      this.router.navigateByUrl(this.oldPath);
    } else {
      this.router.navigate([this.oldPath, this.id]);
    }
  }

  // ========================
  // Historique navigation
  // ========================
  back(): void {
    if (!this.canGoBack()) return;

    this.currentIndex--;
    this.isHistoryNavigation = true;
    this.location.back();
    this.updateStates();
  }

  forward(): void {
    if (!this.canGoForward()) return;

    this.currentIndex++;
    this.isHistoryNavigation = true;
    this.location.forward();
    this.updateStates();
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private updateStates(): void {
    this.canGoBackSubject.next(this.canGoBack());
    this.canGoForwardSubject.next(this.canGoForward());
  }
}