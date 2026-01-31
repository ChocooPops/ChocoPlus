import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, take, throwError } from 'rxjs';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { HttpClient } from '@angular/common/http';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';

@Injectable({
  providedIn: 'root'
})
export class EditionSelectionPageService {

  private readonly apiUrlSelection: string = `${environment.apiUrlSelection}`;
  private readonly urlModifyHomeSelection: string = 'update-selection-page-home';

  private editSelectionIntoPageSubject: BehaviorSubject<SelectionModel[] | undefined> = new BehaviorSubject<SelectionModel[] | undefined>(undefined);
  private editSelectionInotPage$: Observable<SelectionModel[] | undefined> = this.editSelectionIntoPageSubject.asObservable();

  constructor(private http: HttpClient,
    private selectionService: SelectionService
  ) { }

  public getSelectionPage(): Observable<SelectionModel[] | undefined> {
    return this.editSelectionInotPage$;
  }

  public addNewSelectionIntoPage(newSelection: SelectionModel): void {
    const currentSelections: SelectionModel[] | undefined = this.editSelectionIntoPageSubject.value;
    if (currentSelections) {
      if (!currentSelections.some(item => item.id === newSelection.id)) {
        const updatedSelection: SelectionModel[] = [...currentSelections, newSelection];
        this.editSelectionIntoPageSubject.next(updatedSelection);
      }
    }
  }

  public removeSelectionIntoPage(selectionId: number): void {
    const currentSelections: SelectionModel[] | undefined = this.editSelectionIntoPageSubject.value;
    if (currentSelections) {
      const updatedSelections: SelectionModel[] = currentSelections.filter((item: SelectionModel) => item.id !== selectionId);
      this.editSelectionIntoPageSubject.next(updatedSelections);
    }
  }

  public moveSelectionOnTheBottomOfPage(selectionId: number): void {
    const currentSelections: SelectionModel[] | undefined = this.editSelectionIntoPageSubject.value;
    if (currentSelections) {
      const index = currentSelections.findIndex(selection => selection.id === selectionId);
      if (index >= 0 && index < currentSelections.length - 1) {
        [currentSelections[index], currentSelections[index + 1]] = [currentSelections[index + 1], currentSelections[index]];
        this.editSelectionIntoPageSubject.next(currentSelections);
      }
    }
  }

  public moveSelectionOnTheTopOfPage(selectionId: number): void {
    const currentSelections: SelectionModel[] | undefined = this.editSelectionIntoPageSubject.value;
    if (currentSelections) {
      const index = currentSelections.findIndex(selection => selection.id === selectionId);
      if (index > 0) {
        [currentSelections[index], currentSelections[index - 1]] = [currentSelections[index - 1], currentSelections[index]];
        this.editSelectionIntoPageSubject.next(currentSelections);
      }
    }
  }

  public fetchFillSelectionIntoHomePage(): void {
    this.selectionService.fetchSelectionOnHomePage().pipe(take(1)).subscribe((data: SelectionModel[]) => {
      this.editSelectionIntoPageSubject.next(data);
    })
  }

  public resetEditSelectionPage(): void {
    this.editSelectionIntoPageSubject.next(undefined);
  }

  public fetchModifyHomeSelection(): Observable<MessageReturnedModel> {
    const selectionIds: number[] = this.getEditSelectionPageFormated();
    return this.http.put<any>(`${this.apiUrlSelection}/${this.urlModifyHomeSelection}`, selectionIds).pipe(
      map((data: MessageReturnedModel) => {
        if (data && data.state) {
          this.selectionService.resetSelectionHome();
          this.fetchFillSelectionIntoHomePage();
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  private getEditSelectionPageFormated(): number[] {
    const selection: SelectionModel[] | undefined = this.editSelectionIntoPageSubject.value;
    const selectionIds: number[] = selection?.map((item) => item.id) || [];
    return selectionIds;
  }

}
