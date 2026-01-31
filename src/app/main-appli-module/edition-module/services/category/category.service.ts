import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, take } from 'rxjs';
import { CategorySimpleModel } from '../../models/category/categorySimple.model';
import { CategoryEntirelyModel } from '../../models/category/categoryEntirely.model';
import { CategoryModel } from '../../models/category/category.model';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { MovieModel } from '../../../media-module/models/movie-model';
import { SeriesService } from '../../../media-module/services/series/series.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl: string = `${environment.apiUrlCategory}`;
  private categoriesSubject: BehaviorSubject<CategorySimpleModel[]> = new BehaviorSubject<CategorySimpleModel[]>([]);
  private categories$: Observable<CategorySimpleModel[]> = this.categoriesSubject.asObservable();

  private editCategorySubject: BehaviorSubject<CategoryEntirelyModel> = new BehaviorSubject<CategoryEntirelyModel>(this.getInitialEditCategory());
  private editCategory$: Observable<CategoryEntirelyModel> = this.editCategorySubject.asObservable();

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) {
    this.fetchAllCategories().pipe(take(1)).subscribe(() => { });
  }

  private getInitialEditCategory(): CategoryEntirelyModel {
    return {
      id: -1,
      name: '',
      nameSelection: '',
      movies: [],
      series: []
    }
  }

  private updateEditCategory(newData: Partial<CategoryEntirelyModel>): void {
    this.editCategorySubject.next({
      ...this.editCategorySubject.value,
      ...newData
    });
  }

  public getAllCategories(): Observable<CategorySimpleModel[]> {
    return this.categories$;
  }

  public getEditCategory(): Observable<CategoryEntirelyModel> {
    return this.editCategory$;
  }

  public modifyNameCategory(name: string): void {
    this.updateEditCategory({ name: name });
  }

  public modifyNameSelectionCategory(name: string): void {
    this.updateEditCategory({ nameSelection: name });
  }

  //MOVIE
  public addMovieIntoCategory(movie: MovieModel): void {
    const movies: MovieModel[] = this.editCategorySubject.value.movies;
    if (!movies.some((item: MovieModel) => item.id === movie.id)) {
      movies.push(movie);
      this.updateEditCategory({ movies: movies });
    }
  }
  public removeMovieIntoCategory(idMovie: number): void {
    let movies: MovieModel[] = this.editCategorySubject.value.movies;
    movies = movies.filter((movie: MovieModel) => movie.id !== idMovie);
    this.updateEditCategory({ movies: movies });
  }
  public moveMovieLeftAccordingToCategory(idMovie: number): void {
    let movies: MovieModel[] = this.editCategorySubject.value.movies;
    const index = movies.findIndex(movie => movie.id === idMovie);
    if (index > 0) {
      [movies[index - 1], movies[index]] =
        [movies[index], movies[index - 1]];
      this.updateEditCategory({ movies: movies });
    }
  }
  public moveMovieRightAccordingToCategory(idMovie: number) {
    let movies: MovieModel[] = this.editCategorySubject.value.movies;
    const index = movies.findIndex(movie => movie.id === idMovie);
    if (index < movies.length - 1) {
      [movies[index + 1], movies[index]] =
        [movies[index], movies[index + 1]];
      this.updateEditCategory({ movies: movies });
    }
  }

  //SERIES
  public addSeriesIntoCategory(serie: SeriesModel): void {
    const series: SeriesModel[] = this.editCategorySubject.value.series;
    if (!series.some((item: SeriesModel) => item.id === serie.id)) {
      series.push(serie);
      this.updateEditCategory({ series: series });
    }
  }
  public removeSeriesIntoCategory(idSeries: number): void {
    let series: SeriesModel[] = this.editCategorySubject.value.series;
    series = series.filter((serie: SeriesModel) => serie.id !== idSeries);
    this.updateEditCategory({ series: series });
  }
  public moveSeriesLeftAccordingToCategory(idSeries: number): void {
    let series: SeriesModel[] = this.editCategorySubject.value.series;
    const index = series.findIndex(serie => serie.id === idSeries);
    if (index > 0) {
      [series[index - 1], series[index]] =
        [series[index], series[index - 1]];
      this.updateEditCategory({ series: series });
    }
  }
  public moveSeriesRightAccordingToCategory(idSeries: number) {
    let series: SeriesModel[] = this.editCategorySubject.value.series;
    const index = series.findIndex(serie => serie.id === idSeries);
    if (index < series.length - 1) {
      [series[index + 1], series[index]] =
        [series[index], series[index + 1]];
      this.updateEditCategory({ series: series });
    }
  }

  public resetEditCategory(): void {
    this.editCategorySubject.next(this.getInitialEditCategory());
  }

  public fetchAllCategories(): Observable<CategorySimpleModel[]> {
    if (this.categoriesSubject.value.length <= 0) {
      return this.http.get<any>(`${this.apiUrl}/all-categories`).pipe(
        map((data: CategorySimpleModel[]) => {
          this.categoriesSubject.next(data);
          return this.categoriesSubject.value;
        }),
        catchError((error) => {
          return of([])
        })
      )
    } else {
      return of(this.categoriesSubject.value);
    }
  }

  public setEditCategoryByResearch(id: number): void {
    this.fetchCategoryEntirelyById(id).pipe(take(1)).subscribe((data: CategoryEntirelyModel) => {
      this.editCategorySubject.next(data);
    })
  }

  public fetchCategoryEntirelyById(id: number): Observable<CategoryEntirelyModel> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((data: any) => {
        const medias: MovieModel[] = [];
        const series: SeriesModel[] = [];
        data.movies.forEach((movie: any) => {
          medias.push(this.movieService.createNewMovie(movie));
        });
        data.series.forEach((serie: any) => {
          series.push(this.seriesService.createNewSeries(serie));
        });

        return {
          id: data.id,
          name: data.name,
          nameSelection: data.nameSelection,
          movies: medias,
          series: series
        };
      })
    )
  }

  public fetchSaveNewCategory(): Observable<MessageReturnedModel> {
    const newCategory: CategoryModel = this.getCategoryModelFormated(this.editCategorySubject.value);
    return this.http.post<any>(`${this.apiUrl}/save-category`, newCategory).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other) {
          this.setEditCategoryByResearch(data.other.id);
          const categories: CategorySimpleModel[] = this.categoriesSubject.value;
          categories.push({
            id: data.other.id,
            name: this.editCategorySubject.value.name
          })
          this.categoriesSubject.next(categories);
        }
        return data;
      })
    )
  }

  public fetchModifyCategory(): Observable<MessageReturnedModel> {
    const updateCategory: CategoryModel = this.getCategoryModelFormated(this.editCategorySubject.value);
    return this.http.put<any>(`${this.apiUrl}/update-category`, updateCategory).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other) {
          this.setEditCategoryByResearch(data.other.id);
        }
        return data;
      })
    )
  }

  public fetchDeleteCategory(): Observable<MessageReturnedModel> {
    const categoryId: number = this.editCategorySubject.value.id;
    return this.http.delete<any>(`${this.apiUrl}/${categoryId}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other) {
          let categories: CategorySimpleModel[] = this.categoriesSubject.value;
          categories = categories.filter((cat: CategorySimpleModel) => cat.id !== data.other);
          this.categoriesSubject.next(categories);
          this.resetEditCategory();
        }
        return data;
      })
    )
  }

  private getCategoryModelFormated(category: CategoryEntirelyModel): CategoryModel {
    const movies: number[] = category.movies.map(movie => movie.id);
    const series: number[] = category.series.map(serie => serie.id);
    return {
      id: category.id,
      name: category.name,
      nameSelection: category.nameSelection,
      movies: movies,
      series: series
    }
  }

  private normalizeText(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  public filterCategoriesByFuzzyStart(searchStr: string, categoriesAlreadyGet: CategorySimpleModel[], maxDistance = 1): CategorySimpleModel[] {
    const categories: CategorySimpleModel[] = this.getSymmetricDifference(categoriesAlreadyGet, this.categoriesSubject.value);
    const input = this.normalizeText(searchStr.trim());
    if (input.length < 3) {
      return categories.filter(category =>
        this.normalizeText(category.name).startsWith(input)
      );
    }
    const startsWithMatches: CategorySimpleModel[] = [];
    const fuzzyMatches: CategorySimpleModel[] = [];
    for (const category of categories) {
      const normalized = this.normalizeText(category.name);

      if (normalized.startsWith(input)) {
        startsWithMatches.push(category);
      } else {
        const prefix = normalized.substring(0, input.length);
        if (this.levenshtein(prefix, input) <= maxDistance) {
          fuzzyMatches.push(category);
        }
      }
    }
    return [...startsWithMatches, ...fuzzyMatches];
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
      }
    }
    return matrix[b.length][a.length];
  }

  public filterCategoriesByAnyResearch(categoriesAlreadyGet: CategorySimpleModel[]): CategorySimpleModel[] {
    return this.getSymmetricDifference(categoriesAlreadyGet, this.categoriesSubject.value);
  }

  private getSymmetricDifference(a: CategorySimpleModel[], b: CategorySimpleModel[]): CategorySimpleModel[] {
    const isEqual = (x: CategorySimpleModel, y: CategorySimpleModel) => x.id === y.id;
    const onlyInA = a.filter(itemA => !b.some(itemB => isEqual(itemA, itemB)));
    const onlyInB = b.filter(itemB => !a.some(itemA => isEqual(itemB, itemA)));
    return [...onlyInA, ...onlyInB];
  }

  public getValueOfCategories(): CategorySimpleModel[] {
    return this.categoriesSubject.value;
  }

}
