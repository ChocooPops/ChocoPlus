import { Injectable } from '@angular/core';
import { InputPosterModel } from '../../models/input-poster.interface';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { BehaviorSubject, catchError, Observable, map, throwError, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { VerifTimerShowService } from '../../../common-module/services/verif-timer/verif-timer-show.service';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { CategorySimpleModel } from '../../models/category/categorySimple.model';
import { TranslationTitle } from '../../models/translation-title.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { EditTypePoster } from '../../models/edit-type-movie.interface';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { MovieModel } from '../../../media-module/models/movie-model';
import { EditMovieModel } from '../../models/edit-movie.interface';
import { EditionMediaService } from '../edition-media/edition-media.service';

@Injectable({
  providedIn: 'root'
})
export class EditionMovieService extends EditionMediaService {

  private readonly apiUrlMovie = `${environment.apiUrlMovie}`;
  private readonly urlCreateMovie: string = 'add';
  private readonly urlModifyMovie: string = 'modify';
  private readonly urlDeleteMovie: string = 'delete';

  private editMovieSubject: BehaviorSubject<EditMovieModel> = new BehaviorSubject<EditMovieModel>(this.getInitialMovie());
  private editMovie$: Observable<EditMovieModel> = this.editMovieSubject.asObservable();

  constructor(http: HttpClient,
    private verifTimerShowService: VerifTimerShowService,
    private movieService: MovieService,
  ) {
    super(http);
  }

  private getInitialMovie(): EditMovieModel {
    return {
      id: -1,
      title: undefined,
      jellyfinId: undefined,
      otherTitles: [],
      startShow: '00:00:00',
      endShow: '00:00:00',
      directors: [],
      actors: [],
      categories: [],
      keyWords: [],
      date: new Date(),
      description: undefined,
      posters: this.getInitialPosters(),
      horizontalPoster: this.getInitialPosters(),
      horizontalPosterSameAsBackground: false,
      logo: undefined,
      backgroundImage: undefined,
    };
  }

  public updateMovie(newData: Partial<EditMovieModel>): void {
    this.editMovieSubject.next({
      ...this.editMovieSubject.value,
      ...newData
    });
  }

  public getOldSelectedPoster(idPoster: number, idSelection: number): String {
    const editMovie = this.editMovieSubject.getValue();
    const indexPoster = editMovie.posters.findIndex(poster => poster.id === idPoster);
    const indexSelection = editMovie.posters[indexPoster].typePoster.findIndex(selection => selection.id === idSelection);
    return this.getSelectionPosterById(editMovie.posters[indexPoster].typePoster[indexSelection].type_id);
  }

  public getSelectionNotSelected(idPoster: number): EditTypePoster[] {
    const editMovie = this.editMovieSubject.getValue();
    let selectionNotSelected: EditTypePoster[] = this.typeSelectionPoster;
    const indexPoster = editMovie.posters.findIndex(poster => poster.id === idPoster);

    editMovie.posters[indexPoster].typePoster.forEach((type) => {
      selectionNotSelected = selectionNotSelected.filter((item) => item.type != type.type_id)
    })

    return selectionNotSelected;
  }

  public getEditMovie(): Observable<EditMovieModel> {
    return this.editMovie$;
  }

  public modifyTitleMovie(title: string | undefined): void {
    this.updateMovie({ title: title });
  }

  public modifyJellyfinId(jellyfinId: string | undefined): void {
    this.updateMovie({ jellyfinId: jellyfinId });
  }

  public modifyDirectorMovie(director: string[]): void {
    this.updateMovie({ directors: director });
  }

  public modifyActorsMovie(actors: string[]): void {
    this.updateMovie({ actors: actors });
  }

  public modifyCategories(categories: CategorySimpleModel[]): void {
    this.updateMovie({ categories: categories });
  }

  public modifyKeyWords(keyWords: string[]): void {
    this.updateMovie({ keyWords: keyWords });
  }

  public modifyDate(newDate: Date): void {
    this.updateMovie({ date: newDate })
  }

  public modifyDescription(description: string | undefined): void {
    this.updateMovie({ description });
  }

  public modifyOtherLanguageTitle(titles: TranslationTitle[]): void {
    this.updateMovie({ otherTitles: titles });
  }


  public addPoster(): void {
    const newPoster: InputPosterModel = this.getNewPoster();
    this.updateMovie({
      posters: [...this.editMovieSubject.value.posters, newPoster]
    });
  }

  public fillPoster(id: number, srcPoster: ArrayBuffer): void {
    const posters: InputPosterModel[] = this.editMovieSubject.value.posters.map(poster =>
      poster.id === id ? { ...poster, srcPoster } : poster
    );
    this.updateMovie({ posters });
  }

  public addNewSelectionInPoster(id: number): void {
    const posters: InputPosterModel[] = this.editMovieSubject.value.posters.map(poster =>
      poster.id === id && poster.typePoster.length < 3
        ? { ...poster, typePoster: [...poster.typePoster, { id: this.getId(), type_id: this.getSelectionNotSelected(id)[0].type }] }
        : poster
    );
    this.updateMovie({ posters });
  }

  public removePoster(id: number): void {
    let posters = this.editMovieSubject.value.posters;
    if (posters.length > 1) {
      posters = posters.filter(poster => poster.id !== id);
    } else {
      posters = posters.map(poster => poster.id === id ? { ...poster, srcPoster: null } : poster);
    }
    this.updateMovie({ posters });
  }

  public removeSelectionInPoster(idPoster: number, idSelection: number) {
    const posters: InputPosterModel[] = this.editMovieSubject.value.posters.map(poster =>
      poster.id === idPoster
        ? { ...poster, typePoster: poster.typePoster.filter(sel => sel.id !== idSelection) }
        : poster
    );
    this.updateMovie({ posters });
  }

  public modifySelectionInPoster(idPoster: number, idSelection: number, newValue: SelectionType): void {
    const posters: InputPosterModel[] = this.editMovieSubject.value.posters.map(poster =>
      poster.id === idPoster
        ? {
          ...poster,
          typePoster: poster.typePoster.map(sel =>
            sel.id === idSelection ? { ...sel, type_id: newValue } : sel
          )
        }
        : poster
    );
    this.updateMovie({ posters });
  }

  public modifyLogoMovie(logoMovie: string | ArrayBuffer | undefined | null): void {
    this.updateMovie({ logo: logoMovie });
  }

  public modifyBackgroundImageMovie(backgroundImage: string | ArrayBuffer | undefined | null): void {
    const state: boolean | undefined = this.radioButtonHorizontalSameAsBackSubject.value.find((radio: SimpleModel) => radio.state === true)?.value;
    this.updateMovie({ backgroundImage: backgroundImage });
    if (state && backgroundImage) {
      this.addBackgroundImageIntoPosterHorizontal(undefined);
    } else {
      this.deleteBackgroundImageIntoPosterHorizontal(undefined);
    }
  }

  public addPosterHorizontal(): void {
    const newPoster: InputPosterModel = this.getNewPoster();
    this.updateMovie({ horizontalPoster: [...this.editMovieSubject.value.horizontalPoster, newPoster] })
  }

  public removePosterHorizontal(id: number): void {
    let posters: InputPosterModel[] = this.editMovieSubject.value.horizontalPoster;
    if (posters.find(poster => poster.id === id)?.typePoster.some((type) => type.type_id === SelectionType.HORIZONTAL_POSTER)) {
      this.modifyStateHorizontalPoster(400);
    } else {
      if (posters.length > 1) {
        posters = posters.filter((item: InputPosterModel) => item.id !== id);
      } else {
        posters = posters.map(poster => poster.id === id ? { ...poster, srcPoster: null } : poster);
      }
      this.updateMovie({ horizontalPoster: posters })
    }
    if (this.editMovieSubject.value.horizontalPoster.length <= 0) {
      this.updateMovie({ horizontalPoster: [this.getNewPoster()] });
    }
  }

  public fillPosterHorizontal(id: number, srcPoster: string | ArrayBuffer | undefined | null, change: boolean = true): void {
    let posters: InputPosterModel[] = this.editMovieSubject.value.horizontalPoster;
    let radioButton: boolean = this.editMovieSubject.value.horizontalPosterSameAsBackground;
    if (change && posters.find(poster => poster.id === id)?.typePoster.some((type) => type.type_id === SelectionType.HORIZONTAL_POSTER)) {
      posters = posters.map(poster => poster.id === id ? { ...poster, srcPoster: srcPoster, typePoster: [{ id: this.getId(), type_id: SelectionType.NORMAL_POSTER }] } : poster);
      radioButton = false;
      this.changeStateRadioButtonHorizontalPoster(400);
    } else {
      posters = this.editMovieSubject.value.horizontalPoster.map(poster =>
        poster.id === id ? { ...poster, srcPoster } : poster
      );
    }
    this.updateMovie({ horizontalPoster: posters, horizontalPosterSameAsBackground: radioButton });
  }

  private changeStateRadioButtonHorizontalPoster(id: number): boolean {
    const updatedData: SimpleModel[] = this.radioButtonHorizontalSameAsBackSubject.value.map(radio => ({
      ...radio,
      state: radio.id === id
    }));
    this.radioButtonHorizontalSameAsBackSubject.next(updatedData);
    return updatedData.find((radio: SimpleModel) => radio.id === id)?.value;
  }

  public modifyStateHorizontalPoster(id: number): void {
    this.changeStateRadioButtonHorizontalPoster(id);
    const state: boolean = this.changeStateRadioButtonHorizontalPoster(id);
    if (state && this.editMovieSubject.value.backgroundImage) {
      this.addBackgroundImageIntoPosterHorizontal(state);
    } else {
      this.deleteBackgroundImageIntoPosterHorizontal(state);
    }
  }

  private addBackgroundImageIntoPosterHorizontal(state: boolean | undefined): void {
    const id: number | undefined = this.editMovieSubject.value.horizontalPoster.find((poster) => poster.typePoster.some(type => type.type_id === SelectionType.HORIZONTAL_POSTER))?.id;
    const back = this.editMovieSubject.value.backgroundImage;
    if (id) {
      this.fillPosterHorizontal(id, back, false);
    } else {
      const newPoster: InputPosterModel = {
        id: this.getId(),
        srcPoster: back,
        typePoster: [
          {
            id: this.getId(),
            type_id: SelectionType.HORIZONTAL_POSTER
          }
        ]
      }
      let updatedMovie: EditMovieModel;
      if (state !== undefined) {
        updatedMovie = { ...this.editMovieSubject.value, horizontalPosterSameAsBackground: state, horizontalPoster: [newPoster, ...this.editMovieSubject.value.horizontalPoster] }
      } else {
        updatedMovie = { ...this.editMovieSubject.value, horizontalPoster: [...this.editMovieSubject.value.horizontalPoster, newPoster] }
      }
      this.editMovieSubject.next(updatedMovie);
    }
  }

  private deleteBackgroundImageIntoPosterHorizontal(state: boolean | undefined): void {
    const newPoster: InputPosterModel[] = this.editMovieSubject.value.horizontalPoster.filter((poster) => poster.typePoster.some(type => type.type_id !== SelectionType.HORIZONTAL_POSTER));
    let updatedMovie: EditMovieModel;
    if (state !== undefined) {
      updatedMovie = { ...this.editMovieSubject.value, horizontalPosterSameAsBackground: state, horizontalPoster: newPoster }
    } else {
      updatedMovie = { ...this.editMovieSubject.value, horizontalPoster: newPoster }
    }
    this.editMovieSubject.next(updatedMovie);
  }

  public resetEditMovie(): void {
    this.editMovieSubject.next(this.getInitialMovie());
    this.radioButtonHorizontalSameAsBackSubject.next(this.getInitialRadioButtonPosterSameAsBackground());
  }

  public modifyStartShow(timerStart: string): void {
    /*
    const start: number = this.verifTimerShowService.convertTimerInSecond(timerStart);
    const timer: string = this.verifTimerShowService.convertSecondInGoodFormatTimer(start);
    let end: number = this.verifTimerShowService.convertTimerInSecond(this.editMovieSubject.value.endShow);
    if (start > end) {
      end = start + 90;
      const timer: string = this.verifTimerShowService.convertSecondInGoodFormatTimer(end);
      this.updateMovie({ endShow: timer })
    }
    const timer: string = this.verifTimerShowService.convertSecondInGoodFormatTimer(start);
    */
    this.updateMovie({ startShow: timerStart });
  }

  public modifyEndShow(timerEnd: string): void {
    /*
    const end: number = this.verifTimerShowService.convertTimerInSecond(timerEnd);
    const timer: string = this.verifTimerShowService.convertSecondInGoodFormatTimer(end);
    let start: number = this.verifTimerShowService.convertTimerInSecond(this.editMovieSubject.value.startShow);
    if (start > end) {
      start = end - 90;
      if (start < 0) {
        start = 0;
      }
      const timer: string = this.verifTimerShowService.convertSecondInGoodFormatTimer(start);
      this.updateMovie({ startShow: timer });
    }
    const timer: string = this.verifTimerShowService.convertSecondInGoodFormatTimer(end);
    */
    this.updateMovie({ endShow: timerEnd })
  }

  public setEditMovieImmediatlyByIdMovie(id: number): void {
    this.movieService.fetchMovieById(id).pipe(take(1)).subscribe((movie: MovieModel) => {
      this.setEditMovieByResearch(movie);
    });
  }

  public setEditMovieByResearch(movie: MovieModel): void {
    let state: boolean;
    if (movie.srcBackgroundImage && movie.srcPosterHorizontal?.includes(movie.srcBackgroundImage)) {
      this.changeStateRadioButtonHorizontalPoster(300);
      movie.srcPosterHorizontal = movie.srcPosterHorizontal.filter((poster) => poster !== movie.srcBackgroundImage);
      state = true;
    } else {
      this.changeStateRadioButtonHorizontalPoster(400);
      state = false;
    }

    const newMovie: EditMovieModel = {
      id: movie.id,
      title: movie.title,
      jellyfinId: movie.jellyfinId,
      otherTitles: movie.otherTitles || [],
      startShow: movie.startShow || '00:00:00',
      endShow: movie.endShow || '00:00:00',
      directors: movie.directors || [],
      actors: movie.actors || [],
      categories: movie.categories || [],
      date: movie.date || new Date(),
      keyWords: movie.keyWord ?? [],
      description: movie.description,
      posters: this.setPosterForMediaResearched(movie),
      horizontalPoster: this.setPosterHorizontalResearched(movie, state),
      logo: movie.srcLogo !== undefined ? movie.srcLogo.toString() : undefined,
      horizontalPosterSameAsBackground: state,
      backgroundImage: movie.srcBackgroundImage !== undefined ? movie.srcBackgroundImage.toString() : undefined,
    }
    if (!movie.srcPosterNormal && !movie.srcPosterSpecial && !movie.srcPosterLicense) {
      newMovie.posters = this.getInitialPosters();
    }
    this.editMovieSubject.next(newMovie);
  }

  public setEditMovieNull(): void {
    this.updateMovie({ id: -1000 });
  }

  public fetchCreateNewMovie(): Observable<MessageReturnedModel> {
    const movieData: EditMovieModel = structuredClone(this.editMovieSubject.value);
    movieData.horizontalPoster = movieData.horizontalPoster.filter((poster) => poster.typePoster.some(type => type.type_id !== SelectionType.HORIZONTAL_POSTER));
    return this.http.post<any>(`${this.apiUrlMovie}/${this.urlCreateMovie}`, movieData).pipe(
      map((data: MessageReturnedModel) => {
        if (data.other) {
          this.movieService.fetchMovieById(data.other.id).pipe(take(1)).subscribe((data: MovieModel) => {
            this.setEditMovieByResearch(data);
          });
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchModifyMovie(): Observable<MessageReturnedModel> {
    const movieData: EditMovieModel = structuredClone(this.editMovieSubject.value);
    movieData.horizontalPoster = movieData.horizontalPoster.filter((poster) => poster.typePoster.some(type => type.type_id !== SelectionType.HORIZONTAL_POSTER));
    return this.http.put<any>(`${this.apiUrlMovie}/${this.urlModifyMovie}`, this.editMovieSubject.value).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.movieService.fetchMovieById(data.other.id).pipe(take(1)).subscribe((data: MovieModel) => {
            this.setEditMovieByResearch(data);
          });
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchDeleteMovie(): Observable<MessageReturnedModel> {
    const id: number = this.editMovieSubject.value.id;
    return this.http.delete<any>(`${this.apiUrlMovie}/${this.urlDeleteMovie}/${id}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.resetEditMovie();
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }
}
