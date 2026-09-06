import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, take, throwError } from 'rxjs';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { HttpClient } from '@angular/common/http';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { UserService } from '../../../user-module/service/user/user.service';
import { SimpleModel } from '../../../../common-module/models/simple-model';

@Injectable({
  providedIn: 'root'
})
export class EditionSelectionPageService {

  public getInitialDisplayType(): SimpleModel[] {
    return [
      {
        id: 1,
        name: 'EDITION.BY_ORDER',
        value: false,
        state: true
      },
      {
        id: 2,
        name: 'EDITION.BY_RANDOM',
        value: true,
        state: false
      }
    ]
  }
  
  private readonly apiUrlSelection: string = `${environment.apiUrlSelection}`;
  private readonly urlModifyHomeSelection: string = 'update-selection-page-home';

  private editSelectionIntoPageSubject: BehaviorSubject<SelectionModel[] | undefined> = new BehaviorSubject<SelectionModel[] | undefined>(undefined);
  private editSelectionInotPage$: Observable<SelectionModel[] | undefined> = this.editSelectionIntoPageSubject.asObservable();

  private radioButtonDisplayTypeSubject: BehaviorSubject<SimpleModel[]> = new BehaviorSubject<SimpleModel[]>(this.getInitialDisplayType())
  private radioButtonDisplayType$: Observable<SimpleModel[]> = this.radioButtonDisplayTypeSubject.asObservable();

  constructor(private readonly http: HttpClient,
    private readonly selectionService: SelectionService,
    private readonly userService: UserService
  ) { }

  public getSelectionPage(): Observable<SelectionModel[] | undefined> {
    return this.editSelectionInotPage$;
  }

  public getRadioButtonDisplayType(): Observable<SimpleModel[]> {
    return this.radioButtonDisplayType$;
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
    this.selectionService.fetchSelectionOnHomePageByOrder().pipe(take(1)).subscribe((data: SelectionModel[]) => {
      const userId: number = this.userService.getCurrentUserValue()?.id ?? -1;
      data = data.filter((item: SelectionModel) => item.id !== userId);
      this.editSelectionIntoPageSubject.next(data);
      if (data && data.length > 0 && data[0].isOrderRandom) {
          this.modifyOrderType(2);
        } else {
          this.modifyOrderType(1);
        }
    });
  }

  public resetEditSelectionPage(): void {
    this.editSelectionIntoPageSubject.next(undefined);
    this.radioButtonDisplayTypeSubject.next(this.getInitialDisplayType());
  }

  public fetchModifyHomeSelection(): Observable<MessageReturnedModel> {
    const isOrderRandom: boolean = this.radioButtonDisplayTypeSubject.value.find((item) => item.state)?.value ?? false;
    const selectionIds: number[] = this.getEditSelectionPageFormated();
    return this.http.put<any>(`${this.apiUrlSelection}/${this.urlModifyHomeSelection}`, { selectionIds, isOrderRandom }).pipe(
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

  public modifyOrderType(id: number): void {
    const updatedButtons: SimpleModel[] = this.radioButtonDisplayTypeSubject.getValue().map(radio => ({
      ...radio,
      state: radio.id === id,
    }));
    this.radioButtonDisplayTypeSubject.next(updatedButtons);
  }

}
