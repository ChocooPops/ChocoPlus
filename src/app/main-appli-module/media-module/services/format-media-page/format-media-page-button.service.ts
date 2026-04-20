import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormatMediaPageModel } from '../../models/format-media-page-enum';

@Injectable({
  providedIn: 'root',
})
export class FormatMediaPageButtonService {

  private readonly formatMediaPageName: string = 'FORMAT_MEDIA_PAGE';
  private formatMediaPageSubject: BehaviorSubject<FormatMediaPageModel> = new BehaviorSubject<FormatMediaPageModel>(this.initCompressedPoster(FormatMediaPageModel.VERTICAL));
  private formatMediaPage$: Observable<FormatMediaPageModel> = this.formatMediaPageSubject.asObservable();

  private initCompressedPoster(scale: FormatMediaPageModel): FormatMediaPageModel {
    const item = localStorage.getItem(this.formatMediaPageName) as FormatMediaPageModel;
    if (item && Object.values(FormatMediaPageModel).includes(item)) {
      return item;
    } else {
      localStorage.setItem(this.formatMediaPageName, scale);
      return scale;
    }
  }

  public getCurrentFormatMediaPage(): Observable<FormatMediaPageModel> {
    return this.formatMediaPage$;
  }

  public getCurrentFormatMediaPageValue(): FormatMediaPageModel {
    return this.formatMediaPageSubject.value;
  }

  public toggleFormatMediaPage(): void {
    const currentValue: FormatMediaPageModel = this.formatMediaPageSubject.value;
    if (currentValue === FormatMediaPageModel.VERTICAL) {
      this.formatMediaPageSubject.next(FormatMediaPageModel.HORIZONTAL);
      localStorage.setItem(this.formatMediaPageName, FormatMediaPageModel.HORIZONTAL);
    } else {
      this.formatMediaPageSubject.next(FormatMediaPageModel.VERTICAL);
      localStorage.setItem(this.formatMediaPageName, FormatMediaPageModel.VERTICAL);
    }
  }

}
