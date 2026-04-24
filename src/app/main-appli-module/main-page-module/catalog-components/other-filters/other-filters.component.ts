import {
  Component,
  HostListener,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { FilterType } from '../../../media-module/models/catalog/filter-type.enum';
import { FormsModule } from '@angular/forms';
import { Operation } from '../../../media-module/models/catalog/operation.enum';
import { FILTERS } from '../../../media-module/models/catalog/filters.interface';

@Component({
  selector: 'app-other-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './other-filters.component.html',
  styleUrl: './other-filters.component.css',
})
export class OtherFiltersComponent {
  @ViewChild('filterSelected') filterSelected!: ElementRef;
  @ViewChild('fcWrap') fcWrap!: ElementRef;
  @ViewChild('textInput') textInput!: ElementRef<HTMLInputElement>;
  @Output() onFilterCreated = new EventEmitter<FILTERS>();

  srcCross: string = 'icon/cross-white.svg';

  typeOptions: FilterType[] = [
    FilterType.ACTOR,
    FilterType.DIRECTOR,
    FilterType.KEY_WORD,
    FilterType.CATEGORY,
    FilterType.DECADE,
  ];
  operationOptions: Operation[] = [Operation.CONTAIN, Operation.NOT_CONTAIN];

  selected: { type: FilterType | null; op: Operation | null } = {
    type: null,
    op: null,
  };
  openDropdown: 'type' | 'op' | null = null;
  isOpen: boolean = false;

  textValue: string = '';
  tags: string[] = [];

  private nextId: number = 1;

  openFilter(): void {
    this.isOpen = true;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideBtn =
      this.filterSelected?.nativeElement.contains(target);
    const clickedInsideWrap = this.fcWrap?.nativeElement.contains(target);
    if (!clickedInsideBtn && !clickedInsideWrap) {
      if (this.openDropdown) {
        this.openDropdown = null;
      } else {
        this.closeAndEmit();
      }
    }
    if (!target.closest('.fc-select-wrap')) {
      this.openDropdown = null;
    }
  }

  toggleDropdown(key: 'type' | 'op'): void {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  selectOption(key: 'type' | 'op', value: string): void {
    this.selected[key] = value as any;
    this.openDropdown = null;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (
        this.textValue === '' &&
        this.selected.type &&
        this.selected.op &&
        this.tags.length > 0
      ) {
        this.closeAndEmit();
        this.isOpen = true;
      } else {
        this.addTag();
      }
    } else if (
      event.key === 'Backspace' &&
      this.textValue === '' &&
      this.tags.length > 0
    ) {
      this.tags.pop();
    }
  }

  addTag(): void {
    const val = this.textValue.trim();
    if (val && !this.tags.includes(val)) {
      this.tags.push(val);
    }
    this.textValue = '';
    this.textInput?.nativeElement.focus();
  }

  removeTag(index: number): void {
    this.tags.splice(index, 1);
  }

  private closeAndEmit(): void {
    if (this.textValue.trim()) {
      this.addTag();
    }

    if (this.selected.type && this.selected.op && this.tags.length > 0) {
      const filter: FILTERS = {
        id: this.nextId++,
        title: `${this.selected.type} ${this.selected.op}`,
        typeData: this.selected.type,
        operation: this.selected.op,
        value: this.tags.map((t) => ({ name: t, value: t })),
      };
      this.onFilterCreated.emit(filter);
    }

    this.isOpen = false;
    this.selected = { type: null, op: null };
    this.tags = [];
    this.textValue = '';
    this.openDropdown = null;
  }
}
