import { Component } from '@angular/core';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputCategoriesEditionComponent } from '../input-categories-edition/input-categories-edition.component';
import { InputKeywordsEditionComponent } from '../input-keywords-edition/input-keywords-edition.component';
import { InputTextAreaEditionComponent } from '../input-text-area-edition/input-text-area-edition.component';
import { InputPosterEditionComponent } from '../input-poster-edition/input-poster-edition.component';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { SettingMovieAbstraction } from '../abstract-components/setting-movie-abstraction.directive';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { InputTimeEditionComponent } from '../input-time-edition/input-time-edition.component';
import { NgClass } from '@angular/common';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { PopupComponent } from '../popup/popup.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { map, distinctUntilChanged, take, finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EditionMovieService } from '../../services/edition-movie/edition-movie.service';
import { InputDateComponent } from '../input-date/input-date.component';
import { AiButtonComponent } from '../ai-button/ai-button.component';
import { InputLanguageTitleComponent } from '../input-language-title/input-language-title.component';
import { InputPosterHorizontalEditionComponent } from '../input-poster-horizontal-edition/input-poster-horizontal-edition.component';
import { TmdbOperationService } from '../../services/tmdb-operation/tmdb-operation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EditMovieModel } from '../../models/edit-movie.interface';
import { MovieModel } from '../../../media-module/models/movie-model';

@Component({
  selector: 'app-setting-modify-movie',
  standalone: true,
  imports: [ButtonSaveComponent, InputPosterHorizontalEditionComponent, InputLanguageTitleComponent, AiButtonComponent, InputDateComponent, PopupComponent, ButtonRemoveComponent, NgClass, InputTimeEditionComponent, InputRadioButtonComponent, InputImageEditionComponent, InputPosterEditionComponent, InputTextAreaEditionComponent, InputKeywordsEditionComponent, InputCategoriesEditionComponent, InputTextEditionComponent, InputResearchMovieComponent],
  templateUrl: './setting-modify-movie.component.html',
  styleUrls: ['./setting-modify-movie.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifyMovieComponent extends SettingMovieAbstraction {

  private messageDelete: string = 'Cette action supprimera définitivement le film';
  private messageModify: string = 'Cette action enregistrera les modifications faites au film';
  private typeOperation !: number;

  constructor(editionMovieService: EditionMovieService,
    private route: ActivatedRoute,
    tmdbOperationService: TmdbOperationService
  ) {
    super(editionMovieService, tmdbOperationService)
  }

  setMovieWantedToModifyIt(media: MovieModel) {
    this.displayLoader = true;
    this.editionMovieService.resetEditMovie();
    this.editionMovieService.setEditMovieImmediatlyByIdMovie(media.id);
  }

  override ngOnInit(): void {
    this.subscription = this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      distinctUntilChanged()
    ).subscribe((id: string | null) => {
      this.editionMovieService.resetEditMovie();
      this.initSubscriptionOfEditMovie();
      if (id) {
        this.editionMovieService.setEditMovieImmediatlyByIdMovie(Number(id));
      }
    });
  }

  override ngOnDestroy(): void {
    this.unsubscribeEditMovie();
    this.unsubscribeSearchMovie();
    this.editionMovieService.resetEditMovie();
  }

  private emitModifyMovie(): void {
    this.editionMovieService.fetchModifyMovie().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }

  private emitDeleteMovie(): void {
    this.editionMovieService.fetchDeleteMovie().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
        this.displayLoader = false;
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 3);
      }
    });
  }

  public onClickDeleteMovie(): void {
    this.typeOperation = 0;
    this.popup.setMessage(this.messageDelete, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  public onClickModifyMovie(): void {
    this.typeOperation = 1;
    this.popup.setMessage(this.messageModify, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  public emitActionData(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    if (this.typeOperation === 0) {
      this.emitDeleteMovie();
    } else if (this.typeOperation === 1) {
      this.emitModifyMovie();
    }
  }

  public async onClickButtonTmdb(): Promise<void> {
    if (this.editMovie.title && this.editMovie.title.trim() !== '') {
      this.buttonSearchTmdb.changeLoadingActivate(true);
      this.unsubscribeSearchMovie();
      this.subscriptionSearch = this.tmdbOperationService.fetchSearchMovieInfoByTmdbDataBase(this.editMovie.title, this.editMovie.id, this.editMovie).pipe(take(1), finalize(() => {
        this.buttonSearchTmdb.changeLoadingActivate(false);
      })).subscribe({
        next: (data: EditMovieModel) => {
          this.editionMovieService.updateMovie(data);
        }
      })
    }
  }

  public async onClickButtonJellyfin(): Promise<void> {
    if (this.editMovie.jellyfinId && this.editMovie.jellyfinId.trim() !== '') {
      this.buttonSearchJellyfin.changeLoadingActivate(true);
      this.unsubscribeSearchMovie();
      this.subscriptionSearch = this.tmdbOperationService.fetchSearchMovieInfoByByJellyfinDataBase(this.editMovie.jellyfinId, this.editMovie.id, this.editMovie).pipe(take(1), finalize(() => {
        this.buttonSearchJellyfin.changeLoadingActivate(false);
      })).subscribe({
        next: (data: EditMovieModel) => {
          this.editionMovieService.updateMovie(data);
        }
      })
    }
  }

}
