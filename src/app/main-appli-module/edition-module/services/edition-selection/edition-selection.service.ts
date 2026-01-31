import { Injectable } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { MediaModel } from '../../../media-module/models/media.interface';
import { BehaviorSubject, catchError, map, Observable, throwError, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { EditSelectionModel } from '../../../edition-module/models/edit-selection.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { SelectionService } from '../../../media-module/services/selection/selection.service';

@Injectable({
  providedIn: 'root'
})
export class EditionSelectionService {

  public getInitiakButtonTypeSelection(): SimpleModel[] {
    return [
      {
        id: 1,
        name: 'Sélection normale',
        value: SelectionType.NORMAL_POSTER,
        state: false
      },
      {
        id: 2,
        name: 'Sélection spéciale',
        value: SelectionType.SPECIAL_POSTER,
        state: false
      }
    ]
  }

  public getInitialSelection(): SelectionModel {
    return {
      id: -1,
      name: "",
      typeSelection: SelectionType.NORMAL_POSTER,
      mediaList: []
    }
  }

  constructor(private http: HttpClient,
    private selectionService: SelectionService
  ) { }

  private appiUrlSelection: string = `${environment.apiUrlSelection}`;
  private urlAddselection: string = 'add';
  private urlModifySelection: string = 'modify';
  private urlDeleteSelection: string = 'delete';

  private radioButtonTypeSelectionSubject: BehaviorSubject<SimpleModel[]> = new BehaviorSubject<SimpleModel[]>(this.getInitiakButtonTypeSelection())
  private radioButtonTypeSelection$: Observable<SimpleModel[]> = this.radioButtonTypeSelectionSubject.asObservable();

  private editSelectionSubject: BehaviorSubject<SelectionModel> = new BehaviorSubject<SelectionModel>(this.getInitialSelection());
  private editSelection$: Observable<SelectionModel> = this.editSelectionSubject.asObservable();

  private get editSelection(): SelectionModel {
    return this.editSelectionSubject.value;
  }

  private updateSelection(): void {
    this.editSelectionSubject.next({ ...this.editSelection });
  }

  public updateSelectionFromAi(selection: SelectionModel): void {
    this.editSelectionSubject.next(selection);
  }

  public getRadioButtonTypeSelection(): Observable<SimpleModel[]> {
    return this.radioButtonTypeSelection$;
  }

  public modifySelectionName(nameSelection: string): void {
    this.editSelection.name = nameSelection;
    this.updateSelection();
  }

  public modifyTypeSelection(id: number): void {
    const updatedButtons: SimpleModel[] = this.radioButtonTypeSelectionSubject.getValue().map(radio => ({
      ...radio,
      state: radio.id === id,
    }));
    this.radioButtonTypeSelectionSubject.next(updatedButtons);
    this.editSelection.typeSelection = this.radioButtonTypeSelectionSubject.value.find(item => item.id === id)?.value || '';
    this.updateSelection();
  }

  public addMediaIntoSelection(media: MediaModel): void {
    if (!this.editSelection.mediaList.some(item => item.id === media.id)) {
      this.editSelection.mediaList.push(media);
      this.updateSelection();
    }
  }

  public removeMediaFromSelection(id: number): void {
    this.editSelection.mediaList = this.editSelection.mediaList.filter(media => media.id !== id);
    this.updateSelection();
  }

  public moveMediaOnTheLeftOfSelection(id: number): void {
    const index = this.editSelection.mediaList.findIndex(media => media.id === id);
    if (index > 0) {
      [this.editSelection.mediaList[index - 1], this.editSelection.mediaList[index]] =
        [this.editSelection.mediaList[index], this.editSelection.mediaList[index - 1]];
      this.updateSelection();
    }
  }

  public moveMediaOnTheRightOfSelection(id: number): void {
    const index = this.editSelection.mediaList.findIndex(media => media.id === id);
    if (index < this.editSelection.mediaList.length - 1) {
      [this.editSelection.mediaList[index + 1], this.editSelection.mediaList[index]] =
        [this.editSelection.mediaList[index], this.editSelection.mediaList[index + 1]];
      this.updateSelection();
    }
  }

  public getSelectionEdition(): Observable<SelectionModel> {
    return this.editSelection$;
  }

  public resetAllEditSelection(): void {
    this.editSelectionSubject.next(this.getInitialSelection());
    this.radioButtonTypeSelectionSubject.next(this.getInitiakButtonTypeSelection());
  }

  public setEditSelectionById(id: number): void {
    this.selectionService.fetchSelectionById(id).pipe(take(1)).subscribe((selection: SelectionModel) => {
      this.setSelectionByResearched(selection);
    });
  }

  public setSelectionByResearched(selection: SelectionModel): void {
    this.editSelectionSubject.next(selection);
    if (selection.typeSelection === SelectionType.NORMAL_POSTER) {
      this.modifyTypeSelection(1);
    } else if (selection.typeSelection === SelectionType.SPECIAL_POSTER) {
      this.modifyTypeSelection(2);
    }
  }

  public fetchAddNewSelection(): Observable<MessageReturnedModel> {
    const newSelection: EditSelectionModel = this.getEditSelectonFormated(this.editSelectionSubject.value);
    return this.http.post<any>(`${this.appiUrlSelection}/${this.urlAddselection}`, newSelection).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other) {
          this.setEditSelectionById(data.other.id);
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchModifySelection(): Observable<MessageReturnedModel> {
    const updatedSelection: EditSelectionModel = this.getEditSelectonFormated(this.editSelectionSubject.value);
    return this.http.put<any>(`${this.appiUrlSelection}/${this.urlModifySelection}`, updatedSelection).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other) {
          this.setEditSelectionById(data.other.id);
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchDeleteSelection(): Observable<MessageReturnedModel> {
    const id: number = this.editSelectionSubject.value.id;
    return this.http.delete<any>(`${this.appiUrlSelection}/${this.urlDeleteSelection}/${id}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.resetAllEditSelection();
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  private getEditSelectonFormated(selection: SelectionModel): EditSelectionModel {
    const medias: number[] = selection.mediaList.map(media => (media.id));
    return {
      id: selection.id,
      selectionType: selection.typeSelection,
      name: selection.name,
      mediaList: medias
    }
  }

}
