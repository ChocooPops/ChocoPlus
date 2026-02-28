import { Component, ElementRef, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { FilterModel } from '../../../media-module/models/catalog/filter.interface';
import { FiltersCatalogService } from '../../../media-module/services/filters-catalog/filters-catalog.service';
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
  
  srcAsc: string = 'icon/asc.svg';
  srcDesc: string = 'icon/desc.svg';

  orderDirection!: boolean;
  subscription: Subscription = new Subscription();
  isOpen: boolean = false;

  constructor(private readonly filtersCatalogService: FiltersCatalogService,
    private readonly elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.filtersCatalogService.getOrderDirectionSort().subscribe((data: boolean) => {
        this.orderDirection = data;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public toggleOrderDirection(): void {
    this.filtersCatalogService.toggleOrderDirectionSort();
  }

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
