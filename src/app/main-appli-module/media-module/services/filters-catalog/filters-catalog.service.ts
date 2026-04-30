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
    name: 'Décennie',
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
    name: 'Categorie',
    type: FilterType.CATEGORY,
    filters: []
  };

  private mediaTypeFilter: FiltersChoicesModel = {
    name: 'Média',
    type: FilterType.MEDIA,
    filters: [
    {
      id: this.getId(),
      name: 'TOUT',
      value: MediaTypeModel.ALL,
      isSelected: 2,
    },
    {
      id: this.getId(),
      name: 'FILM',
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
      name: 'Titre',
      value: SortCatalog.TITLE,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: 'Date de sortie',
      value: SortCatalog.RELEASE_DATE,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: "Date d'ajout",
      value: SortCatalog.ADDED_DATE,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: 'Durée',
      value: SortCatalog.DURATION,
      isSelected: 0,
    },
    {
      id: this.getId(),
      name: 'Aléatoire',
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
            name: category.name,
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
              title: '',
              typeData: FilterType.MEDIA,
              operation: Operation.CONTAIN,
              value: [
                {
                  name: 'TOUT',
                  value: MediaTypeModel.ALL
                }
            ]
          }
      ]
    filters[0].title = this.getTitleByFilter(filters[0]);
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
    const filtres: FILTERS[] = this.FILTERS_SUBJECT.value;
    filtre.title = this.getTitleByFilter(filtre);
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
    filtre.title = this.getTitleByFilter(filtre);
    filtres.push(filtre);
    this.FILTERS_SUBJECT.next(filtres);
  }

  public deleteFilter(filtre: FILTERS): any {
    if (filtre.typeData === FilterType.DECADE) {
      this.decadeFilter.filters.forEach((el) => {
        if (filtre.value.some((item) => item.value === el.value)) {
          el.isSelected = 0;
        }
      });
    } else if (filtre.typeData === FilterType.CATEGORY) {
      this.categoryFilter.filters.forEach((el) => {
        if (filtre.value.some((item) => item.value === el.value)) {
          el.isSelected = 0;
        }
      });
    } else if (filtre.typeData === FilterType.MEDIA) {
      return null;
    }
    let filtres: FILTERS[] = this.FILTERS_SUBJECT.value;
    filtres = filtres.filter((item) => item.id !== filtre.id);
    this.FILTERS_SUBJECT.next(filtres);
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

  private getTitleByFilter(filtre: FILTERS): string {
    let type: string = filtre.typeData;
    let operation: string = filtre.operation;
    let values: string = filtre.value.map((item) => item.name).join(' & ');
    if (filtre.typeData === FilterType.DECADE) {
      type = "Décennie";
    } else if (filtre.typeData === FilterType.CATEGORY) {
      type = "Catégorie";
    } else if (filtre.typeData === FilterType.MEDIA) {
      type = "Média";
    }

    if (filtre.operation === "CONTAIN") {
      operation = "contient";
    } else if (filtre.operation === "NOT_CONTAIN") {
      operation = "ne contient pas";
    }

    return `${type} ${operation} ${values}`
  }

  public setFilterFromMediaPage(filtres: FILTERS[]): void {
    const filtresSubject: FILTERS[] = this.FILTERS_SUBJECT.value.slice(0, 1);
    filtres.forEach((filtre: FILTERS) => {
      filtre.title = this.getTitleByFilter(filtre);
      filtresSubject.push(filtre);
    });
    this.FILTERS_SUBJECT.next(filtresSubject);
  }

}
