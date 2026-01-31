import { Injectable } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { SelectionType } from '../../models/selection-type.enum';

@Injectable({
  providedIn: 'root'
})
export class SelectionLoadingService {

  selections: SimpleModel[] = [
    {
      id: 0,
      name: 'Selection_1',
      value: SelectionType.NORMAL_POSTER,
    },
    {
      id: 1,
      name: 'Selection_2',
      value: SelectionType.NORMAL_POSTER,
    },
    {
      id: 2,
      name: 'Selection_3',
      value: SelectionType.NORMAL_POSTER,
    },
    {
      id: 3,
      name: 'Selection_4',
      value: SelectionType.SPECIAL_POSTER,
    },
    {
      id: 4,
      name: 'Selection_5',
      value: SelectionType.NORMAL_POSTER,
    },
    {
      id: 5,
      name: 'Selection_6',
      value: SelectionType.NORMAL_POSTER,
    },
    {
      id: 6,
      name: 'Selection_7',
      value: SelectionType.NORMAL_POSTER,
    },
    {
      id: 7,
      name: 'Selection_8',
      value: SelectionType.SPECIAL_POSTER,
    }
  ]

  getSelectionLoading(): SimpleModel[] {
    return this.selections;
  }

}
