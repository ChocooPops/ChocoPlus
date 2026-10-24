import { Directive, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SpriteModel } from "../models/sprite.interface";
import { SpriteObserver } from "../services/sprite-observer.service";

// Looping scenery layer: the image is repeated just enough to cover the screen + 1,
// then the strip slides by exactly one image width at the sprite's speed (px/s).
@Directive({})
export abstract class AbstractElementComponent implements OnInit, OnDestroy {

  public sprite !: SpriteModel;
  public copies: number[] = [];
  public scrollDistance: string = '0px';
  public scrollDuration: number = 0;

  protected subscription: Subscription = new Subscription();

  protected abstract getSpriteObserver(): SpriteObserver;

  ngOnInit(): void {
    this.subscription.add(
      this.getSpriteObserver().getSprite().subscribe((sprite: SpriteModel) => {
        this.sprite = sprite;
        this.updateScrolling();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize')
  onResizeScrolling(): void {
    this.updateScrolling();
  }

  private updateScrolling(): void {
    const width: number = this.sprite.width;
    if (width <= 0 || this.sprite.speed <= 0) {
      return;
    }
    const count: number = Math.ceil(window.innerWidth / width) + 1;
    if (count !== this.copies.length) {
      this.copies = Array.from({ length: count }, (_, index: number) => index);
    }
    this.scrollDistance = `${width}px`;
    this.scrollDuration = width / this.sprite.speed;
  }

}
