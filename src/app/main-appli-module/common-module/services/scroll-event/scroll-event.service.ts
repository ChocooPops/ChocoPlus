import { Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollEventService {

  private isTopAchievementSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isTopAchievement$: Observable<boolean> = this.isTopAchievementSubject.asObservable();
  private renderer !: Renderer2;
  private containerElement!: HTMLElement;
  private scrollListener!: () => void;

  public setRenderer(renderer: Renderer2): void {
    this.renderer = renderer;
  }

  public setContainerElement(element: HTMLElement): void {
    this.containerElement = element;
  }

  public setScrollListener(): void {
    if (this.renderer && this.containerElement) {
      this.scrollListener = this.renderer.listen(this.containerElement, 'scroll', () => {
        const scrollTop = this.containerElement.scrollTop;
        this.isTopAchievementSubject.next(scrollTop > 10);
      });
    }
  }

  public IfTopScrollIsAchievement(): Observable<boolean> {
    return this.isTopAchievement$;
  }

  public scrollToTop(): void {
    if (this.containerElement) {
      this.containerElement.scrollTo({ top: 0 });
    }
  }

  public scrollToTopWithSmooth(): void {
    if (this.containerElement) {
      this.containerElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public disableScrollEvent(): void {
    if (this.renderer && this.containerElement) {
      this.renderer.setStyle(this.containerElement, 'overflow', 'hidden');
    }
  }

  public enableScrollEvent(): void {
    if (this.renderer && this.containerElement) {
      this.renderer.removeStyle(this.containerElement, 'overflow');
    }
  }

}
