import { Component, Input, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { FiltersModel } from '../../../media-module/models/catalog/filters.interface';
import { NgClass } from '@angular/common';
import { FilterModel } from '../../../media-module/models/catalog/filter.interface';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [NgClass],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {

  @Input() filter!: FiltersModel;
  @Output() onClicked = new EventEmitter<number>();
  srcArrow: string = 'icon/arrow-2.svg';
  isOpen: boolean = false;
  default!: FilterModel | undefined;

  constructor(private readonly elementRef: ElementRef) { }

  ngOnInit(): void {
    this.default = this.filter.filters.find((item) => item.value === null);
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

  getFilterSelected(): string {
    return this.filter.filters.find((item) => item.isSelected === true && item.value != null)?.name || this.filter.name;
  }

  onClickFilter(id: number): void {
    this.onClicked.emit(id);
    setTimeout(() => {
      this.isOpen = false;
    });
  }

}
