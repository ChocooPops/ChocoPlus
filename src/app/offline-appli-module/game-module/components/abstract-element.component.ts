import { Directive, ViewChild, Renderer2, ElementRef } from "@angular/core";
import { Subscription } from "rxjs";
import { SpriteModel } from "../models/sprite.interface";

@Directive({})
export abstract class AbstractElementComponent {

  @ViewChild('scrollContent') scrollContentRef!: ElementRef;
  @ViewChild('imgComponent') imgComponent !: ElementRef;

  protected tabIteration: number[] = [];
  protected subscription: Subscription = new Subscription();

  constructor(protected renderer: Renderer2) { }

  abstract ngOnInit(): void;

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  protected initIteration(iteration: number): void {
    for (let i = 0; i < iteration; i++) {
      this.tabIteration.push(i);
    }
  }

  setAnimationScrolling(sprite: SpriteModel): void {
    if (this.scrollContentRef?.nativeElement) {
      this.renderer.setStyle(
        this.scrollContentRef.nativeElement,
        'animation',
        `scroll-game ${sprite.speed}s linear infinite`
      );
    }
  }

}