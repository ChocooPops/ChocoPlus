import { Component, Input, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { FiltersChoicesModel } from '../../../media-module/models/catalog/filters-choices.interface';
import { FILTERS } from '../../../media-module/models/catalog/filters.interface';
import { Operation } from '../../../media-module/models/catalog/operation.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent {

  @Input() filter!: FiltersChoicesModel;
  @Output() onClicked = new EventEmitter<FILTERS>();
  srcArrow: string = 'icon/arrow-2.svg';
  isOpen: boolean = false;
  private static nextId: number = 1;
  private pendingFilter: FILTERS | null = null;

  constructor(private readonly elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closeAndEmit();
    }
  }

  openFilter(): void {
    this.isOpen = true;
  }

  onClickFilter(event: MouseEvent, id: number): void {
    event.stopPropagation();

    const choice = this.filter.filters.find((f) => f.id === id);
    if (!choice) return;

    const isCtrl = event.ctrlKey || event.metaKey;

    if (isCtrl) {
      choice.isSelected = choice.isSelected === 1 ? 0 : 1;
    } else {
      this.filter.filters.forEach((f) => {
        if (f.isSelected !== 2) {
          f.isSelected = 0;
        }
      });
      choice.isSelected = 1;
    }

    const selectedChoices = this.filter.filters.filter(
      (f) => f.isSelected === 1,
    );

    if (selectedChoices.length === 0) {
      this.pendingFilter = null;
    } else {
      this.pendingFilter = {
        id: this.pendingFilter?.id ?? FilterComponent.nextId++,
        typeData: this.filter.type,
        operation: Operation.CONTAIN,
        value: selectedChoices.map((f) => ({ name: f.name, value: f.value })),
      };
    }

    if (!isCtrl) {
      setTimeout(() => this.closeAndEmit());
    }
  }

  private closeAndEmit(): void {
    this.isOpen = false;
    if (this.pendingFilter) {
      this.onClicked.emit(this.pendingFilter);
    }
    this.pendingFilter = null;
    if (this.filter) {
      this.filter.filters.forEach((f) => {
        if (f.isSelected !== 2) {
          f.isSelected = 0;
        }
      });
    }
  }
}
