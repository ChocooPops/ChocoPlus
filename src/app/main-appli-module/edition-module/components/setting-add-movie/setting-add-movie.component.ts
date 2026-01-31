import { Component } from '@angular/core';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputCategoriesEditionComponent } from '../input-categories-edition/input-categories-edition.component';
import { InputKeywordsEditionComponent } from '../input-keywords-edition/input-keywords-edition.component';
import { InputTextAreaEditionComponent } from '../input-text-area-edition/input-text-area-edition.component';
import { InputPosterEditionComponent } from '../input-poster-edition/input-poster-edition.component';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { SettingMovieAbstraction } from '../abstract-components/setting-movie-abstraction.directive';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { InputTimeEditionComponent } from '../input-time-edition/input-time-edition.component';
import { NgClass } from '@angular/common';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { PopupComponent } from '../popup/popup.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { finalize, take } from 'rxjs';
import { InputDateComponent } from '../input-date/input-date.component';
import { AiButtonComponent } from '../ai-button/ai-button.component';
import { InputLanguageTitleComponent } from '../input-language-title/input-language-title.component';
import { InputPosterHorizontalEditionComponent } from '../input-poster-horizontal-edition/input-poster-horizontal-edition.component';
import { HttpErrorResponse } from '@angular/common/http';
import { EditMovieModel } from '../../models/edit-movie.interface';

@Component({
  selector: 'app-setting-add-movie',
  standalone: true,
  imports: [NgClass, InputDateComponent, InputPosterHorizontalEditionComponent, InputLanguageTitleComponent, PopupComponent, AiButtonComponent, ButtonRemoveComponent, InputTextEditionComponent, InputTimeEditionComponent, InputRadioButtonComponent, InputCategoriesEditionComponent, InputKeywordsEditionComponent, InputTextAreaEditionComponent, InputPosterEditionComponent, InputImageEditionComponent, ButtonSaveComponent, InputLanguageTitleComponent],
  templateUrl: './setting-add-movie.component.html',
  styleUrls: ['./setting-add-movie.component.css', '../../styles/edition.css']
})
export class SettingAddMovieComponent extends SettingMovieAbstraction {

  private message: string = 'Cette action ajoutera un nouveau film';

  public onClickAddMovie(): void {
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  public emitAddMovie(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.editionMovieService.fetchCreateNewMovie().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setEndTask(true);
        this.popup.setMessage(data.message, data.state);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 1);
      }
    });
  }

  public onClickReset(): void {
    this.editionMovieService.resetEditMovie();
  }

  public onClickButtonTmdb(): void {
    if (this.editMovie.title && this.editMovie.title.trim() !== '') {
      this.buttonSearchTmdb.changeLoadingActivate(true);
      this.unsubscribeSearchMovie();
      this.subscriptionSearch = this.tmdbOperationService.fetchSearchMovieInfoByTmdbDataBase(this.editMovie.title, this.editMovie.id).pipe(take(1), finalize(() => {
        this.buttonSearchTmdb.changeLoadingActivate(false);
      })).subscribe({
        next: (data: EditMovieModel) => {
          this.editionMovieService.updateMovie(data);
        }
      })
    }
  }

  public onClickButtonJellyfin(): void {
    if (this.editMovie.jellyfinId && this.editMovie.jellyfinId.trim() !== '') {
      this.buttonSearchJellyfin.changeLoadingActivate(true);
      this.unsubscribeSearchMovie();
      this.subscriptionSearch = this.tmdbOperationService.fetchSearchMovieInfoByByJellyfinDataBase(this.editMovie.jellyfinId, this.editMovie.id).pipe(take(1), finalize(() => {
        this.buttonSearchJellyfin.changeLoadingActivate(false);
      })).subscribe({
        next: (data: EditMovieModel) => {
          this.editionMovieService.updateMovie(data);
        }
      })
    }
  }

}
