import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, HostListener, SimpleChanges } from '@angular/core';
import { ButtonDeleteComponent } from '../button-delete/button-delete.component';
import { ButtonAddComponent } from '../button-add/button-add.component';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { InputPosterModel } from '../../models/input-poster.interface';
import { InputSelectionTypeComponent } from '../input-selection-type/input-selection-type.component';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';

@Component({
  selector: 'app-input-poster-edition',
  standalone: true,
  imports: [InputSelectionTypeComponent, ButtonAddComponent, ButtonDeleteComponent, InputImageEditionComponent],
  templateUrl: './input-poster-edition.component.html',
  styleUrl: './input-poster-edition.component.css'
})
export class InputPosterEditionComponent {

  @Input()
  mediaType !: MediaTypeModel;

  @Input()
  posters: InputPosterModel[] = [];

  @Output()
  addNewPoster = new EventEmitter<void>()

  @Output()
  removePoster = new EventEmitter<number>()

  @Output()
  addNewSelection = new EventEmitter<number>()

  @Output()
  removeSelection = new EventEmitter<number[]>()

  @Output()
  fillPoster = new EventEmitter<any[]>()

  exText: string = "ex : Affiche de cinéma";
  srcRemove: string = "icon/delete.svg";

  onClickAddNewPoster() {
    this.addNewPoster.emit();
  }

  onClickRemovePoster(id: number) {
    this.removePoster.emit(id)
  }

  onClickAddNewSelectionInPoster(id: number) {
    this.addNewSelection.emit(id);
  }

  onClickDeleteSelectionInPoster(idPoster: number, idSelection: number) {
    const id: number[] = [idPoster, idSelection];
    this.removeSelection.emit(id);
  }

  selectionIsTheLast(idPoster: number, idSelection: number): boolean {
    let op: boolean = false;
    const index = this.posters.findIndex(poster => poster.id === idPoster)
    if (idSelection === this.posters[index].typePoster[this.posters[index].typePoster.length - 1].id) {
      op = true;
    }
    return op;
  }

  onFillPoster(id: number, srcPoster: string | ArrayBuffer | undefined | null): void {
    let tab: any[] = [id, srcPoster];
    this.fillPoster.emit(tab);
  }

  @ViewChild('scrollBar') scrollBar!: ElementRef<HTMLDivElement>;
  @ViewChild('postersContainer') postersContainer!: ElementRef<HTMLDivElement>;

  private isDragging = false;
  private scrollBarWidth = 0;
  private maxScrollLeft = 0;
  private maxScrollBarLeft = 0;
  private startX = 0;
  transformStylePoster = 'translateX(0px)';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['posters']) {
      setTimeout(() => {
        this.updateScrollBar();
      }, 10);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScrollBar();
  }

  updateScrollBar() {
    const container = this.postersContainer.nativeElement;
    const scrollBar = this.scrollBar.nativeElement;
    const wrapperWidth = container.parentElement!.offsetWidth;
    const contentWidth = container.scrollWidth;
    if (contentWidth <= wrapperWidth) {
      scrollBar.style.display = 'none';
      this.transformStylePoster = 'translateX(0px)';
      return;
    }
    scrollBar.style.display = 'block';
    this.scrollBarWidth = (wrapperWidth / contentWidth) * wrapperWidth;
    this.maxScrollLeft = contentWidth - wrapperWidth;
    this.maxScrollBarLeft = wrapperWidth - this.scrollBarWidth;

    scrollBar.style.width = this.scrollBarWidth + 'px';
    scrollBar.onmousedown = (e: MouseEvent) => {
      this.isDragging = true;
      this.startX = e.clientX - scrollBar.offsetLeft;
      document.onmousemove = this.onMouseMove.bind(this);
      document.onmouseup = this.onMouseUp.bind(this);
    };
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    let newLeft = e.clientX - this.startX;
    newLeft = Math.max(0, Math.min(newLeft, this.maxScrollBarLeft));
    this.scrollBar.nativeElement.style.left = newLeft + 'px';
    const scrollRatio = newLeft / this.maxScrollBarLeft;
    const scrollLeft = scrollRatio * this.maxScrollLeft;
    this.transformStylePoster = `translateX(${-scrollLeft}px)`;
  }

  onMouseUp() {
    this.isDragging = false;
    document.onmousemove = null;
    document.onmouseup = null;
  }

}