import { Component } from '@angular/core';
import { SettingNewsVideoRunning } from '../abstract-components/setting-news-video-running.directive';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { PopupComponent } from '../popup/popup.component';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';
import { EditNewVideoRunningComponent } from '../edit-new-video-running/edit-new-video-running.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { take } from 'rxjs';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-setting-modify-news-series-running',
  standalone: true,
  imports: [PopupComponent, InputResearchSeriesComponent, EditNewVideoRunningComponent, ButtonRemoveComponent, ButtonSaveComponent],
  templateUrl: './setting-modify-news-series-running.component.html',
  styleUrls: ['./setting-modify-news-series-running.component.css', '../../../../common-module/styles/loader.css', '../../styles/edition.css']
})
export class SettingModifyNewsSeriesRunningComponent extends SettingNewsVideoRunning {

  protected override mediaType: MediaTypeModel = MediaTypeModel.SERIES;
  private message: string = "Enregistrer les modifications ?";

  public saveNewsSeries(): void {
    this.popup.setDisplayButton(true);
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
  }

  public onFetchModifyNewsSeries(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.editNewsVideoRunningService.fetchModifyNewsSeriesRunning().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    })
  }

  public resetNewsSeries(): void {
    this.displayLoader = true;
    this.editNewsVideoRunningService.resetEditNewsRunningVideo();
    this.editNewsVideoRunningService.fetchAllNewsSeriesRunning().pipe(take(1)).subscribe(() => {
      this.displayLoader = false;
    });
  }

}
