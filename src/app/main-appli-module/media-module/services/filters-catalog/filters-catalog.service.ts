import { Injectable } from '@angular/core';
import { MediaTypeModel } from '../../models/media-type.enum';
import { CategoryService } from '../../../edition-module/services/category/category.service';
import { CategorySimpleModel } from '../../../edition-module/models/category/categorySimple.model';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { FiltersModel } from '../../models/catalog/filters.interface';
import { FilterModel } from '../../models/catalog/filter.interface';

@Injectable({
  providedIn: 'root',
})
export class FiltersCatalogService {
  private id: number = 0;

  private getId(): number {
    this.id++;
    return this.id;
  }

  private decadeFilter: FiltersModel = {
    name: 'Décennie',
    filters: [
      {
        id: this.getId(),
        name: 'Aucune date',
        value: null,
        isSelected: true,
      },
      {
        id: this.getId(),
        name: '2020s',
        value: 2020,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '2010s',
        value: 2010,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '2000s',
        value: 2000,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1990s',
        value: 1990,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1980s',
        value: 1980,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1970s',
        value: 1970,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1960s',
        value: 1960,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1950s',
        value: 1950,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1940s',
        value: 1940,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1930s',
        value: 1930,
        isSelected: false,
      },
      {
        id: this.getId(),
        name: '1920s',
        value: 1920,
        isSelected: false,
      },
    ],
  };

  private categoryFilter: FiltersModel = {
    name: 'Categorie',
    filters: [
      {
        id: this.getId(),
        name: 'Aucun catégorie',
        value: null,
        isSelected: true,
      }
    ]
  };

  private mediaTypeFilter: FiltersModel = {
    name: 'Média',
    filters: [
      {
      id: this.getId(),
      name: 'TOUT',
      value: null,
      isSelected: true,
    },
    {
      id: this.getId(),
      name: 'FILM',
      value: MediaTypeModel.MOVIE,
      isSelected: false,
    },
    {
      id: this.getId(),
      name: 'SERIES',
      value: MediaTypeModel.SERIES,
      isSelected: false,
    },
    ]
  }

  private sortFilter: FilterModel[] = [
    {
      id: this.getId(),
      name: 'Titre',
      value: 'Titre',
      isSelected: false,
    },
    {
      id: this.getId(),
      name: 'Date de sortie',
      value: 'Titre',
      isSelected: false,
    },
    {
      id: this.getId(),
      name: "Date d'ajout",
      value: 'Titre',
      isSelected: true,
    },
    {
      id: this.getId(),
      name: 'Durée',
      value: 'Titre',
      isSelected: false,
    },
    {
      id: this.getId(),
      name: 'Aléatoire',
      value: 'Titre',
      isSelected: false,
    },
  ];

  private orderDirectionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private orderDirection$: Observable<boolean> = this.orderDirectionSubject.asObservable();

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
            isSelected: false,
          });
        });
      });
  }

  public getDecadeFilter(): FiltersModel {
    return this.decadeFilter;
  }

  public getCategoryFilter(): FiltersModel {
    return this.categoryFilter;
  }

  public getMediaTypeFilter(): FiltersModel {
    return this.mediaTypeFilter;
  }
  
  public getSortFilter(): FilterModel[] {
    return this.sortFilter;
  }

  public getOrderDirectionSort(): Observable<boolean> {
    return this.orderDirection$;
  }

  public toggleOrderDirectionSort(): void {
    const bool: boolean = this.orderDirectionSubject.value;
    this.orderDirectionSubject.next(!bool);
  }

  public onSelectedDecadeFilter(id: number): void {
    this.decadeFilter.filters.some((item) => {
      if(item.id === id) {
        item.isSelected = true;
      } else {
        item.isSelected = false;
      }
    })
  }
  public onSelectedCategoryFilter(id: number): void {
    this.categoryFilter.filters.some((item) => {
      if(item.id === id) {
        item.isSelected = true;
      } else {
        item.isSelected = false;
      }
    })
  }
  public onSelectedMediaTypeFilter(id: number): void {
    this.mediaTypeFilter.filters.some((item) => {
      if(item.id === id) {
        item.isSelected = true;
      } else {
        item.isSelected = false;
      }
    })
  }
  public onSelectedSortFilter(id: number): void {
    this.sortFilter.some((item) => {
      if(item.id === id) {
        item.isSelected = true;
      } else {
        item.isSelected = false;
      }
    })
  }
}
