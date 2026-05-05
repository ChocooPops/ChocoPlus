import { Component, ElementRef, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { FilterChoiceModel } from '../../../media-module/models/catalog/filter-choice.interface';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './sort.component.html',
  styleUrl: './sort.component.css'
})
export class SortComponent {

  @Input() sorts!: FilterChoiceModel[];
  @Output() onClicked = new EventEmitter<number>();
  
  subscription: Subscription = new Subscription();
  isOpen: boolean = false;
  srcArrow: string = 'icon/arrow-2.svg';

  constructor(private readonly elementRef: ElementRef) {}

  getSortSelected(): string {
    return this.sorts.find((item) => item.isSelected === 1)?.name || 'Aucun trie';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen = false;
    }
  }
  
  openFilter(): void {
    this.isOpen = true;
  }
  
  onClickFilter(id: number): void {
    this.onClicked.emit(id);
    setTimeout(() => {
      this.isOpen = false;
    });
  }

}
