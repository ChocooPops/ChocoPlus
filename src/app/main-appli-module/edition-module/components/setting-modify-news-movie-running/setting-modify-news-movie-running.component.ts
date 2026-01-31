import { Component } from '@angular/core';
import { SettingNewsVideoRunning } from '../abstract-components/setting-news-video-running.directive';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { PopupComponent } from '../popup/popup.component';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { EditNewVideoRunningComponent } from '../edit-new-video-running/edit-new-video-running.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { take } from 'rxjs';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-setting-modify-news-movie-running',
  standalone: true,
  imports: [ButtonSaveComponent, ButtonRemoveComponent, PopupComponent, InputResearchMovieComponent, EditNewVideoRunningComponent],
  templateUrl: './setting-modify-news-movie-running.component.html',
  styleUrls: ['./setting-modify-news-movie-running.component.css', '../../../../common-module/styles/loader.css', '../../styles/edition.css']
})
export class SettingModifyNewsMovieRunningComponent extends SettingNewsVideoRunning {

  protected override mediaType: MediaTypeModel = MediaTypeModel.MOVIE;
  private message: string = "Enregistrer les modifications ?";

  public saveNewsMovie(): void {
    this.popup.setDisplayButton(true);
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
  }

  public onFetchModifyNewsSeries(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.editNewsVideoRunningService.fetchModifyNewsMovieRunning().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    })
  }

  public resetNewsMovie(): void {
    this.displayLoader = true;
    this.editNewsVideoRunningService.resetEditNewsRunningVideo();
    this.editNewsVideoRunningService.fetchAllNewsMovieRunning().pipe(take(1)).subscribe(() => {
      this.displayLoader = false;
    });
  }

}
