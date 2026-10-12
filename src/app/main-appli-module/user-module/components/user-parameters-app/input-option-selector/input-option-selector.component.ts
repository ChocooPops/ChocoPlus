import { Component, ElementRef, EventEmitter, Input, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { SimpleModel } from '../../../../../common-module/models/simple-model';

@Component({
  selector: 'app-input-option-selector',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './input-option-selector.component.html',
  styleUrl: './input-option-selector.component.css'
})
export class InputOptionSelectorComponent {

  @Input() options: SimpleModel[] = [];

  @Output() changeEmit = new EventEmitter<number>();

  @ViewChild('indicator') private indicator: ElementRef<HTMLElement> | undefined;
  @ViewChildren('optionRef') private optionRefs: QueryList<ElementRef<HTMLElement>> | undefined;

  private lastPlacement: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private readonly renderer: Renderer2) { }

  get selectedId(): number | null {
    const selected: SimpleModel | undefined = this.options.find((option: SimpleModel) => option.state);
    return selected ? selected.id : null;
  }

  get selectedIndex(): number {
    return this.options.findIndex((option: SimpleModel) => option.state);
  }

  ngOnInit(): void {
    this.subscription.add(
      fromEvent(window, 'resize').subscribe(() => this.placeIndicator(false))
    );
  }

  ngAfterViewInit(): void {
    this.placeIndicator(false);
  }

  ngAfterViewChecked(): void {
    this.placeIndicator(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSelect(option: SimpleModel): void {
    if (option.state) {
      return;
    }
    this.options.forEach((other: SimpleModel) => other.state = other.id === option.id);
    this.changeEmit.emit(option.id);
  }

  onKeyDown(event: KeyboardEvent): void {
    const step: number = this.getStepFromKey(event.key);
    if (step === 0 || this.options.length === 0) {
      return;
    }
    event.preventDefault();
    const current: number = this.selectedIndex;
    const next: number = current === -1 ? 0 : (current + step + this.options.length) % this.options.length;
    this.onSelect(this.options[next]);
  }

  private getStepFromKey(key: string): number {
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      return 1;
    }
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      return -1;
    }
    return 0;
  }

  private placeIndicator(onlyIfMoved: boolean): void {
    const indicatorElement: HTMLElement | undefined = this.indicator?.nativeElement;
    if (!indicatorElement) {
      return;
    }

    const selected: HTMLElement | undefined = this.optionRefs?.get(this.selectedIndex)?.nativeElement;
    if (!selected) {
      this.lastPlacement = '';
      this.renderer.setStyle(indicatorElement, 'opacity', '0');
      return;
    }

    const placement: string = `${selected.offsetLeft}|${selected.offsetTop}|${selected.offsetWidth}|${selected.offsetHeight}`;
    if (onlyIfMoved && placement === this.lastPlacement) {
      return;
    }

    const isFirstPlacement: boolean = this.lastPlacement === '';
    this.lastPlacement = placement;

    this.renderer.setStyle(indicatorElement, 'left', `${selected.offsetLeft}px`);
    this.renderer.setStyle(indicatorElement, 'top', `${selected.offsetTop}px`);
    this.renderer.setStyle(indicatorElement, 'width', `${selected.offsetWidth}px`);
    this.renderer.setStyle(indicatorElement, 'height', `${selected.offsetHeight}px`);
    this.renderer.setStyle(indicatorElement, 'opacity', '1');

    if (isFirstPlacement) {
      requestAnimationFrame(() => this.renderer.addClass(indicatorElement, 'indicator-animated'));
    }
  }

}
