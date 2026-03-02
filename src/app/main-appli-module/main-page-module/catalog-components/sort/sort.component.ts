import { Component, ElementRef, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { FilterModel } from '../../../media-module/models/catalog/filter.interface';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sort.component.html',
  styleUrl: './sort.component.css'
})
export class SortComponent {

  @Input() sorts!: FilterModel[];
  @Output() onClicked = new EventEmitter<number>();
  
  subscription: Subscription = new Subscription();
  isOpen: boolean = false;
  srcArrow: string = 'icon/arrow-2.svg';

  constructor(private readonly elementRef: ElementRef) {}

  getSortSelected(): string {
    return this.sorts.find((item) => item.isSelected === true)?.name || 'Aucun trie';
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
