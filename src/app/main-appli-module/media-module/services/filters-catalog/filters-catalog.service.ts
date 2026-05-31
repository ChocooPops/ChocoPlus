import { Injectable } from '@angular/core';
import { MediaTypeModel } from '../../models/media-type.enum';
import { CategoryService } from '../../../edition-module/services/category/category.service';
import { CategorySimpleModel } from '../../../edition-module/models/category/categorySimple.model';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { SortCatalog } from '../../models/catalog/sort-catalog.enum';
import { FiltersChoicesModel } from '../../models/catalog/filters-choices.interface';
import { FilterChoiceModel } from '../../models/catalog/filter-choice.interface';
import { FilterType } from '../../models/catalog/filter-type.enum';
import { FILTERS } from '../../models/catalog/filters.interface';
import { Operation } from '../../models/catalog/operation.enum';
import { LogicalOperator } from '../../models/catalog/logical-operator';

@Injectable({
  providedIn: 'root',
})
export class FiltersCatalogService {
  
  private id: number = 0;
  private readonly PAGE_SIZE: number = 50;

  private getId(): number {
    this.id++;
    return this.id;
  }

  public getPAGE_SIZE(): number {
    return this.PAGE_SIZE;
  }

  private decadeFilter: FiltersChoicesModel = {
    name: 'DECADE',
    type: FilterType.DECADE,
    filters: [
      {
        id: this.getId(),
        name: '2020s',
        value: 2020,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '2010s',
        value: 2010,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '2000s',
        value: 2000,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1990s',
        value: 1990,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1980s',
        value: 1980,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1970s',
        value: 1970,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1960s',
        value: 1960,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1950s',
        value: 1950,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1940s',
        value: 1940,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1930s',
        value: 1930,
        isSelected: 0,
      },
      {
        id: this.getId(),
        name: '1920s',
        value: 1920,
        isSelected: 0,
      },
    ],
  };

  private categoryFilter: FiltersChoicesModel = {
    name: 'CATEGORY',
    type: FilterType.CATEGORY,
    filters: []
  };

  private mediaTypeFilter: FiltersChoicesModel = {
    name: 'MEDIA',
    type: FilterType.MEDIA,
    filters: [
    {
      id: this.getId(),
      name: 'ALL',
      value: MediaTypeModel.ALL,
      isSelected: 2,
    },
    {
      id: this.getId(),
      name: 'MOVIES',
      value: MediaTypeModel.MOVIE,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: 'SERIES',
      value: MediaTypeModel.SERIES,
      isSelected: 0,
    },
    ]
  }

  private sortFilter: FilterChoiceModel[] = [
    {
      id: this.getId(),
      name: 'FILTER.SORT_TITLE',
      value: SortCatalog.TITLE,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: 'FILTER.SORT_RELEASE_DATE',
      value: SortCatalog.RELEASE_DATE,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: "FILTER.SORT_ADDED_DATE",
      value: SortCatalog.ADDED_DATE,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: 'FILTER.SORT_DURATION',
      value: SortCatalog.DURATION,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: 'FILTER.SORT_SHUFFLE',
      value: SortCatalog.SHUFFLE,
      isSelected: 1,
    },
  ];

  private orderDirectionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private orderDirection$: Observable<boolean> = this.orderDirectionSubject.asObservable();

  private FILTERS_SUBJECT: BehaviorSubject<FILTERS[]> = new BehaviorSubject<FILTERS[]>(this.INIT_FILTER());
  private FILTERS$: Observable<FILTERS[]> = this.FILTERS_SUBJECT.asObservable();

  constructor(private readonly categoryService: CategoryService) {
    this.categoryService
      .fetchAllCategories()
      .pipe(take(1))
      .subscribe((data: CategorySimpleModel[]) => {
        data.forEach((category: CategorySimpleModel) => {
          this.categoryFilter.filters.push({
            id: this.getId(),
            name: category.translationKey,
            value: category.id,
            isSelected: 0,
          });
        });
      });
  }

  private INIT_FILTER(): FILTERS[] {
    const filters: FILTERS[] = [ 
            {
              id: -1,
              typeData: FilterType.MEDIA,
              operation: Operation.CONTAIN,
              logic: LogicalOperator.AND,
              value: [
                {
                  name: 'ALL',
                  value: MediaTypeModel.ALL
                }
            ]
          }
      ]
    return filters;
  }

  public getDecadeFilter(): FiltersChoicesModel {
    return this.decadeFilter;
  }

  public getCategoryFilter(): FiltersChoicesModel {
    return this.categoryFilter;
  }

  public getMediaTypeFilter(): FiltersChoicesModel {
    return this.mediaTypeFilter;
  }
  
  public getSortFilter(): FilterChoiceModel[] {
    return this.sortFilter;
  }

  public getOrderDirectionSort(): Observable<boolean> {
    return this.orderDirection$;
  }
  public getFILTERS(): Observable<FILTERS[]> {
    return this.FILTERS$;
  }

  public toggleOrderDirectionSort(): void {
    const bool: boolean = this.orderDirectionSubject.value;
    this.orderDirectionSubject.next(!bool);
  }

  public onSelectedDecadeFilter(filtre: FILTERS): void {
    this.addFilters(filtre);
    this.decadeFilter.filters.forEach((el) => {
      if (filtre.value.some((item) => item.value === el.value)) {
        el.isSelected = 2;
      }
    });
  }
  public onSelectedCategoryFilter(filtre: FILTERS): void {
    this.addFilters(filtre);
    this.categoryFilter.filters.forEach((el) => {
      if (filtre.value.some((item) => item.value === el.value)) {
        el.isSelected = 2;
      }
    });
  }
  public onSelectedMediaTypeFilter(filtre: FILTERS): void {
    filtre.logic = LogicalOperator.AND;
    const filtres: FILTERS[] = this.FILTERS_SUBJECT.value;
    filtres[0] = filtre;
    this.FILTERS_SUBJECT.next(filtres);
    this.mediaTypeFilter.filters.forEach((el) => {
      if (filtre.value.some((item) => item.value === el.value)) {
        el.isSelected = 2;
      } else {
        el.isSelected = 0
      }
    });
  }

  public addFilters(filtre: FILTERS): void {
    const filtres: FILTERS[] = this.FILTERS_SUBJECT.value;
    filtre.id = this.getId();
    if (filtre.typeData === FilterType.DECADE && !filtre.valueLogic) {
      filtre.valueLogic = filtre.valueLogic ?? LogicalOperator.OR;
    } else {
      filtre.valueLogic = filtre.valueLogic ?? LogicalOperator.AND;
    }
    filtre.logic = filtre.logic ?? LogicalOperator.AND;
    filtres.push(filtre);
    this.FILTERS_SUBJECT.next(filtres);
  }

  public toggleFilterLogic(filtre: FILTERS, index: number): void {
    if (index < 2) return;
    const filtres: FILTERS[] = this.FILTERS_SUBJECT.value;
    const target = filtres.find((f) => f.id === filtre.id);
    if (!target) return;
    target.logic =
      target.logic === LogicalOperator.OR ? LogicalOperator.AND : LogicalOperator.OR;
    this.FILTERS_SUBJECT.next([...filtres]);
  }

  public toggleValueLogic(filtre: FILTERS): void {
    const filtres: FILTERS[] = this.FILTERS_SUBJECT.value;
    const target = filtres.find((f) => f.id === filtre.id);
    if (!target) return;
    target.valueLogic =
      target.valueLogic === LogicalOperator.AND ? LogicalOperator.OR : LogicalOperator.AND;
    this.FILTERS_SUBJECT.next([...filtres]);
  }

  public deleteFilter(filtre: FILTERS): any {
    let filtres: FILTERS[] = this.FILTERS_SUBJECT.value;
    filtres = filtres.filter((item) => item.id !== filtre.id);
    this.FILTERS_SUBJECT.next(filtres);
    this.decadeFilter.filters.forEach((el) => {
      if (filtre.value.some((item) => item.value === el.value)) {
        el.isSelected = 0;
      }
    });
  }

  public onSelectedSortFilter(id: number): SortCatalog {
    let sort!: SortCatalog;
    this.sortFilter.some((item) => {
      if(item.id === id) {
        item.isSelected = 1;
        sort = item.value;
      } else {
        item.isSelected = 0;
      }
    });
    return sort;
  }

  public setFilterFromMediaPage(filtres: FILTERS[]): void {
    const filtresSubject: FILTERS[] = this.FILTERS_SUBJECT.value.slice(0, 1);
    filtres.forEach((filtre: FILTERS) => {
      filtre.id = this.getId();
      filtresSubject.push(filtre);
    });
    this.FILTERS_SUBJECT.next(filtresSubject);
  }

}
