import { Injectable } from '@angular/core';
import { EditionMediaService } from '../edition-media/edition-media.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, throwError, take } from 'rxjs';
import { EditSeriesModel } from '../../models/series/edit-series.interface';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { EditTypePoster } from '../../models/edit-type-movie.interface';
import { CategorySimpleModel } from '../../models/category/categorySimple.model';
import { TranslationTitle } from '../../models/translation-title.interface';
import { InputPosterModel } from '../../models/input-poster.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { EditSeasonModel } from '../../models/series/edit-season.interface';
import { EditEpisodeModel } from '../../models/series/edit-episode.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { SeasonModel } from '../../../media-module/models/series/season.interface';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';

@Injectable({
  providedIn: 'root'
})
export class EditionSeriesService extends EditionMediaService {

  private readonly apiUrlSeries: string = `${environment.apiUrlSeries}`;
  private readonly urlCreateSeries: string = 'add';
  private readonly urlModifySeries: string = 'modify';
  private readonly urlDeleteSeries: string = 'delete';

  private editSeriesSubject: BehaviorSubject<EditSeriesModel> = new BehaviorSubject<EditSeriesModel>(this.getInitialSeries());
  private editSeries$: Observable<EditSeriesModel> = this.editSeriesSubject.asObservable();

  private editSeasonSubject: BehaviorSubject<EditSeasonModel[]> = new BehaviorSubject<EditSeasonModel[]>([this.getNewSeason(this.editSeriesSubject.value.id, 1)]);
  private editSeasons$: Observable<EditSeasonModel[]> = this.editSeasonSubject.asObservable();

  private typeInfoDisplayed: boolean = false;

  constructor(http: HttpClient,
    private seriesService: SeriesService
  ) {
    super(http);
  }

  private getInitialSeries(): EditSeriesModel {
    return {
      id: -1,
      title: undefined,
      jellyfinId: undefined,
      otherTitles: [],
      directors: [],
      actors: [],
      categories: [],
      keyWords: [],
      description: undefined,
      date: new Date(),
      startShow: '00:00:00',
      endShow: '00:00:00',
      posters: this.getInitialPosters(),
      horizontalPoster: this.getInitialPosters(),
      horizontalPosterSameAsBackground: false,
      logo: undefined,
      backgroundImage: undefined,
      seasons: []
    }
  }

  public getEditSeries(): Observable<EditSeriesModel> {
    return this.editSeries$;
  }
  public getTypeInfoDisplayed(): boolean {
    return this.typeInfoDisplayed;
  }

  public updateSeries(newData: Partial<EditSeriesModel>): void {
    this.editSeriesSubject.next({
      ...this.editSeriesSubject.value,
      ...newData
    });
  }

  public getOldSelectedPoster(idPoster: number, idSelection: number): String {
    const editSeries = this.editSeriesSubject.getValue();
    const indexPoster = editSeries.posters.findIndex(poster => poster.id === idPoster);
    const indexSelection = editSeries.posters[indexPoster].typePoster.findIndex(selection => selection.id === idSelection);
    return this.getSelectionPosterById(editSeries.posters[indexPoster].typePoster[indexSelection].type_id);
  }

  public getSelectionNotSelected(idPoster: number): EditTypePoster[] {
    const editSeries = this.editSeriesSubject.getValue();
    let selectionNotSelected: EditTypePoster[] = this.typeSelectionPoster;
    const indexPoster = editSeries.posters.findIndex(poster => poster.id === idPoster);

    editSeries.posters[indexPoster].typePoster.forEach((type) => {
      selectionNotSelected = selectionNotSelected.filter((item) => item.type != type.type_id)
    })

    return selectionNotSelected;
  }

  public modifyTitleSeries(title: string | undefined): void {
    this.updateSeries({ title: title });
  }

  public modifyJellyfinId(jellyfinId: string | undefined): void {
    this.updateSeries({ jellyfinId: jellyfinId });
  }

  public modifyDirectorSeries(director: string[]): void {
    this.updateSeries({ directors: director });
  }

  public modifyActorsSeries(actors: string[]): void {
    this.updateSeries({ actors: actors });
  }

  public modifyCategories(categories: CategorySimpleModel[]): void {
    this.updateSeries({ categories: categories });
  }

  public modifyKeyWords(keyWords: string[]): void {
    this.updateSeries({ keyWords: keyWords });
  }

  public modifyDescription(description: string | undefined): void {
    this.updateSeries({ description });
  }

  public modifyDate(date: Date): void {
    this.updateSeries({ date: new Date(date) });
  }

  public modifyOtherLanguageTitle(titles: TranslationTitle[]): void {
    this.updateSeries({ otherTitles: titles });
  }

  public modifyTypeInfoDisplayed(state: boolean): void {
    this.typeInfoDisplayed = state;
  }

  public modifyStartShow(timerStart: string): void {
    this.updateSeries({ startShow: timerStart });
  }

  public modifyEndShow(timerEnd: string): void {
    this.updateSeries({ endShow: timerEnd })
  }

  public addPoster(): void {
    const newPoster: InputPosterModel = this.getNewPoster();
    this.updateSeries({
      posters: [...this.editSeriesSubject.value.posters, newPoster]
    });
  }

  public fillPoster(id: number, srcPoster: ArrayBuffer): void {
    const posters: InputPosterModel[] = this.editSeriesSubject.value.posters.map(poster =>
      poster.id === id ? { ...poster, srcPoster } : poster
    );
    this.updateSeries({ posters });
  }

  public addNewSelectionInPoster(id: number): void {
    const posters: InputPosterModel[] = this.editSeriesSubject.value.posters.map(poster =>
      poster.id === id && poster.typePoster.length < 3
        ? { ...poster, typePoster: [...poster.typePoster, { id: this.getId(), type_id: this.getSelectionNotSelected(id)[0].type }] }
        : poster
    );
    this.updateSeries({ posters });
  }

  public removePoster(id: number): void {
    let posters = this.editSeriesSubject.value.posters;
    if (posters.length > 1) {
      posters = posters.filter(poster => poster.id !== id);
    } else {
      posters = posters.map(poster => poster.id === id ? { ...poster, srcPoster: null } : poster);
    }
    this.updateSeries({ posters });
  }

  public removeSelectionInPoster(idPoster: number, idSelection: number) {
    const posters: InputPosterModel[] = this.editSeriesSubject.value.posters.map(poster =>
      poster.id === idPoster
        ? { ...poster, typePoster: poster.typePoster.filter(sel => sel.id !== idSelection) }
        : poster
    );
    this.updateSeries({ posters });
  }

  public modifySelectionInPoster(idPoster: number, idSelection: number, newValue: SelectionType): void {
    const posters: InputPosterModel[] = this.editSeriesSubject.value.posters.map(poster =>
      poster.id === idPoster
        ? {
          ...poster,
          typePoster: poster.typePoster.map(sel =>
            sel.id === idSelection ? { ...sel, type_id: newValue } : sel
          )
        }
        : poster
    );
    this.updateSeries({ posters });
  }

  public modifyLogo(logo: string | ArrayBuffer | undefined | null): void {
    this.updateSeries({ logo: logo });
  }

  public modifyBackgroundImage(backgroundImage: string | ArrayBuffer | undefined | null): void {
    const state: boolean | undefined = this.radioButtonHorizontalSameAsBackSubject.value.find((radio: SimpleModel) => radio.state === true)?.value;
    this.updateSeries({ backgroundImage: backgroundImage });
    if (state && backgroundImage) {
      this.addBackgroundImageIntoPosterHorizontal(undefined);
    } else {
      this.deleteBackgroundImageIntoPosterHorizontal(undefined);
    }
  }

  public addPosterHorizontal(): void {
    const newPoster: InputPosterModel = this.getNewPoster();
    this.updateSeries({ horizontalPoster: [...this.editSeriesSubject.value.horizontalPoster, newPoster] })
  }

  public removePosterHorizontal(id: number): void {
    let posters: InputPosterModel[] = this.editSeriesSubject.value.horizontalPoster;
    if (posters.find(poster => poster.id === id)?.typePoster.some((type) => type.type_id === SelectionType.HORIZONTAL_POSTER)) {
      this.modifyStateHorizontalPoster(400);
    } else {
      if (posters.length > 1) {
        posters = posters.filter((item: InputPosterModel) => item.id !== id);
      } else {
        posters = posters.map(poster => poster.id === id ? { ...poster, srcPoster: null } : poster);
      }
      this.updateSeries({ horizontalPoster: posters })
    }
    if (this.editSeriesSubject.value.horizontalPoster.length <= 0) {
      this.updateSeries({ horizontalPoster: [this.getNewPoster()] });
    }
  }

  public fillPosterHorizontal(id: number, srcPoster: string | ArrayBuffer | undefined | null, change: boolean = true): void {
    let posters: InputPosterModel[] = this.editSeriesSubject.value.horizontalPoster;
    let radioButton: boolean = this.editSeriesSubject.value.horizontalPosterSameAsBackground;
    if (change && posters.find(poster => poster.id === id)?.typePoster.some((type) => type.type_id === SelectionType.HORIZONTAL_POSTER)) {
      posters = posters.map(poster => poster.id === id ? { ...poster, srcPoster: srcPoster, typePoster: [{ id: this.getId(), type_id: SelectionType.NORMAL_POSTER }] } : poster);
      radioButton = false;
      this.changeStateRadioButtonHorizontalPoster(400);
    } else {
      posters = this.editSeriesSubject.value.horizontalPoster.map(poster =>
        poster.id === id ? { ...poster, srcPoster } : poster
      );
    }
    this.updateSeries({ horizontalPoster: posters, horizontalPosterSameAsBackground: radioButton });
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
    if (state && this.editSeriesSubject.value.backgroundImage) {
      this.addBackgroundImageIntoPosterHorizontal(state);
    } else {
      this.deleteBackgroundImageIntoPosterHorizontal(state);
    }
  }

  private addBackgroundImageIntoPosterHorizontal(state: boolean | undefined): void {
    const id: number | undefined = this.editSeriesSubject.value.horizontalPoster.find((poster) => poster.typePoster.some(type => type.type_id === SelectionType.HORIZONTAL_POSTER))?.id;
    const back = this.editSeriesSubject.value.backgroundImage;
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
      let updatedSeries: EditSeriesModel;
      if (state !== undefined) {
        updatedSeries = { ...this.editSeriesSubject.value, horizontalPosterSameAsBackground: state, horizontalPoster: [newPoster, ...this.editSeriesSubject.value.horizontalPoster] }
      } else {
        updatedSeries = { ...this.editSeriesSubject.value, horizontalPoster: [...this.editSeriesSubject.value.horizontalPoster, newPoster] }
      }
      this.editSeriesSubject.next(updatedSeries);
    }
  }

  private deleteBackgroundImageIntoPosterHorizontal(state: boolean | undefined): void {
    const newPoster: InputPosterModel[] = this.editSeriesSubject.value.horizontalPoster.filter((poster) => poster.typePoster.some(type => type.type_id !== SelectionType.HORIZONTAL_POSTER));
    let updatedSeries: EditSeriesModel;
    if (state !== undefined) {
      updatedSeries = { ...this.editSeriesSubject.value, horizontalPosterSameAsBackground: state, horizontalPoster: newPoster }
    } else {
      updatedSeries = { ...this.editSeriesSubject.value, horizontalPoster: newPoster }
    }
    this.editSeriesSubject.next(updatedSeries);
  }

  public resetEditSeries(): void {
    this.editSeriesSubject.next(this.getInitialSeries());
    this.editSeasonSubject.next([this.getNewSeason(this.editSeriesSubject.value.id, 1)]);
    this.radioButtonHorizontalSameAsBackSubject.next(this.getInitialRadioButtonPosterSameAsBackground());
    this.typeInfoDisplayed = false;
  }

  private getNewEpisode(seasonId: number, episodeNumber: number): EditEpisodeModel {
    return {
      id: this.getId(),
      seasonId: seasonId,
      name: undefined,
      episodeNumber: episodeNumber,
      description: undefined,
      date: new Date(),
      srcPoster: undefined,
      jellyfinId: undefined
    }
  }

  private getNewSeason(seriesId: number, seasonNumber: number): EditSeasonModel {
    const id: number = this.getId();
    return {
      id: id,
      jellyfinId: undefined,
      seriesId: seriesId,
      name: "Saison " + seasonNumber,
      seasonNumber: seasonNumber,
      srcPoster: undefined,
      episodes: [this.getNewEpisode(id, 1)]
    }
  }

  public getEditSeasons(): Observable<EditSeasonModel[]> {
    return this.editSeasons$;
  }

  public updateSeasons(seasons: EditSeasonModel[]): void {
    this.editSeasonSubject.next(seasons)
  }

  public addNewSeason(): void {
    const editSeasons: EditSeasonModel[] = this.editSeasonSubject.value;
    const newSeason: EditSeasonModel = this.getNewSeason(this.editSeriesSubject.value.id, editSeasons.length + 1);
    editSeasons.push(newSeason);
    this.editSeasonSubject.next(editSeasons);
  }
  public deleteSeasonByIndex(deletedIdx: number, selectedIdx: number): number {
    const current = this.editSeasonSubject.value;
    if (deletedIdx < 0 || deletedIdx >= current.length || current.length <= 1) {
      return selectedIdx;
    }
    const seasons = [...current];
    seasons.splice(deletedIdx, 1);

    // Réindexer / renommer
    seasons.forEach((season, idx) => {
      const num = idx + 1;
      season.seasonNumber = num;
      season.name = `Saison ${num}`;
    });

    this.editSeasonSubject.next(seasons);

    return this.newIndexAfterDeletion(selectedIdx, deletedIdx, current.length);
  }

  public addNewEpisode(seasonIdx: number): void {
    const seasons: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < seasons.length) {
      seasons[seasonIdx].episodes.push(this.getNewEpisode(seasons[seasonIdx].id, seasons[seasonIdx].episodes.length + 1));
      this.editSeasonSubject.next(seasons);
    }
  }
  public deleteEpisodeByIndex(seasonIdx: number, episodeIdx: number): void {
    const seasons: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < seasons.length) {
      const episode: EditEpisodeModel[] = seasons[seasonIdx].episodes;
      if (episodeIdx >= 0 && episodeIdx < episode.length && episode.length > 1) {
        seasons[seasonIdx].episodes.splice(episodeIdx, 1);
        seasons[seasonIdx].episodes.forEach((episode: EditEpisodeModel, idx: number) => {
          episode.episodeNumber = idx + 1;
        })
        this.editSeasonSubject.next(seasons);
      }
    }
  }

  public modifyNameBySeasonIndex(idx: number, name: string): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (idx >= 0 && idx < season.length) {
      season[idx].name = name;
      this.editSeasonSubject.next(season);
    }
  }
  public modifyJellyfinIdBySeasonIndex(idx: number, jellyfinId: string): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (idx >= 0 && idx < season.length) {
      season[idx].jellyfinId = jellyfinId;
      this.editSeasonSubject.next(season);
    }
  }
  public modifyPosterBySeasonIndex(idx: number, poster: string | ArrayBuffer | undefined | null): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (idx >= 0 && idx < season.length) {
      season[idx].srcPoster = poster;
      this.editSeasonSubject.next(season);
    }
  }

  public modifyJellyfinIdEpisodeByIndex(seasonIdx: number, episodeIdx: number, jellyfinId: string): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < season.length) {
      const episode: EditEpisodeModel[] = season[seasonIdx].episodes;
      if (episodeIdx >= 0 && episodeIdx < episode.length) {
        season[seasonIdx].episodes[episodeIdx].jellyfinId = jellyfinId;
      }
    }
  }
  public modifyPosterEpisodeByIndex(seasonIdx: number, episodeIdx: number, poster: string | ArrayBuffer | undefined | null): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < season.length) {
      const episode: EditEpisodeModel[] = season[seasonIdx].episodes;
      if (episodeIdx >= 0 && episodeIdx < episode.length) {
        season[seasonIdx].episodes[episodeIdx].srcPoster = poster;
      }
    }
  }
  public modifyTitleEpisodeByIndex(seasonIdx: number, episodeIdx: number, name: string): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < season.length) {
      const episode: EditEpisodeModel[] = season[seasonIdx].episodes;
      if (episodeIdx >= 0 && episodeIdx < episode.length) {
        season[seasonIdx].episodes[episodeIdx].name = name;
      }
    }
  }
  public modifyDescriptionEpisodeByIndex(seasonIdx: number, episodeIdx: number, description: string): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < season.length) {
      const episode: EditEpisodeModel[] = season[seasonIdx].episodes;
      if (episodeIdx >= 0 && episodeIdx < episode.length) {
        season[seasonIdx].episodes[episodeIdx].description = description;
      }
    }
  }
  public modifyDateEpisodeByIndex(seasonIdx: number, episodeIdx: number, date: Date): void {
    const season: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < season.length) {
      const episode: EditEpisodeModel[] = season[seasonIdx].episodes;
      if (episodeIdx >= 0 && episodeIdx < episode.length) {
        season[seasonIdx].episodes[episodeIdx].date = date;
      }
    }
  }

  private newIndexAfterDeletion(
    selectedIdx: number,
    deletedIdx: number,
    oldLength: number
  ): number {
    const newLength = Math.max(0, oldLength - 1);
    if (newLength === 0) return -1;                      // plus rien à sélectionner

    if (selectedIdx === deletedIdx) {
      // On a supprimé l’élément sélectionné → prendre le plus proche restant
      return Math.min(deletedIdx, newLength - 1);
    }
    if (selectedIdx < deletedIdx) {
      // L’élément sélectionné était avant → il garde son indice
      return selectedIdx;
    }
    // L’élément sélectionné était après → il recule d’un cran
    return selectedIdx - 1;
  }


  public moveEpisodeToTop(seasonIdx: number, episodeIdx: number): void {
    const seasons: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < seasons.length) {
      const episodes: EditEpisodeModel[] = seasons[seasonIdx].episodes;
      if (episodeIdx > 0 && episodeIdx < episodes.length) {
        const temp = episodes[episodeIdx - 1];
        episodes[episodeIdx - 1] = episodes[episodeIdx];
        episodes[episodeIdx - 1].episodeNumber = episodes[episodeIdx].episodeNumber - 1;

        episodes[episodeIdx] = temp;
        episodes[episodeIdx].episodeNumber = temp.episodeNumber + 1;
      }
      this.editSeasonSubject.next(seasons);
    }
  }

  public moveEpisodeToBottom(seasonIdx: number, episodeIdx: number): void {
    const seasons: EditSeasonModel[] = this.editSeasonSubject.value;
    if (seasonIdx >= 0 && seasonIdx < seasons.length) {
      const episodes: EditEpisodeModel[] = seasons[seasonIdx].episodes;
      if (episodeIdx >= 0 && episodeIdx < episodes.length - 1) {
        const temp = episodes[episodeIdx + 1];
        episodes[episodeIdx + 1] = episodes[episodeIdx];
        episodes[episodeIdx + 1].episodeNumber = episodes[episodeIdx].episodeNumber + 1;

        episodes[episodeIdx] = temp;
        episodes[episodeIdx].episodeNumber = temp.episodeNumber - 1;
      }
      this.editSeasonSubject.next(seasons);
    }
  }

  public fetchCreateNewSeries(): Observable<MessageReturnedModel> {
    const seriesData: EditSeriesModel = structuredClone(this.editSeriesSubject.value);
    seriesData.horizontalPoster = seriesData.horizontalPoster.filter((poster) => poster.typePoster.some(type => type.type_id !== SelectionType.HORIZONTAL_POSTER));
    seriesData.seasons = this.editSeasonSubject.value;
    return this.http.post<any>(`${this.apiUrlSeries}/${this.urlCreateSeries}`, seriesData).pipe(
      map((data: MessageReturnedModel) => {
        if (data.other) {
          this.seriesService.fetchSeasonsById(data.other.id).pipe(take(1)).subscribe((data: SeriesModel) => {
            this.setEditSeriesByResearch(data);
          });
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  public fetchModifySeries(): Observable<MessageReturnedModel> {
    const seriesData: EditSeriesModel = structuredClone(this.editSeriesSubject.value);
    seriesData.horizontalPoster = seriesData.horizontalPoster.filter((poster) => poster.typePoster.some(type => type.type_id !== SelectionType.HORIZONTAL_POSTER));
    seriesData.seasons = this.editSeasonSubject.value;
    return this.http.put<any>(`${this.apiUrlSeries}/${this.urlModifySeries}`, seriesData).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.seriesService.fetchSeasonsById(data.other.id).pipe(take(1)).subscribe((data: SeriesModel) => {
            this.setEditSeriesByResearch(data);
          });
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  public fetchDeleteSeries(): Observable<MessageReturnedModel> {
    const id: number = this.editSeriesSubject.value.id;
    return this.http.delete<any>(`${this.apiUrlSeries}/${this.urlDeleteSeries}/${id}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.resetEditSeries();
        }
        return data
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  private setEditSeriesByResearch(series: SeriesModel): void {
    let state: boolean;
    if (series.srcBackgroundImage && series.srcPosterHorizontal?.includes(series.srcBackgroundImage)) {
      this.changeStateRadioButtonHorizontalPoster(300);
      series.srcPosterHorizontal = series.srcPosterHorizontal.filter((poster) => poster !== series.srcBackgroundImage);
      state = true;
    } else {
      this.changeStateRadioButtonHorizontalPoster(400);
      state = false;
    }

    const newSeries: EditSeriesModel = {
      id: series.id,
      title: series.title,
      jellyfinId: series.jellyfinId,
      otherTitles: series.otherTitles || [],
      directors: series.directors || [],
      actors: series.actors || [],
      categories: series.categories || [],
      keyWords: series.keyWord ?? [],
      description: series.description,
      date: series.date ? new Date(series.date) : new Date(),
      startShow: series.startShow || '00:00:00',
      endShow: series.endShow || '00:00:00',
      posters: this.setPosterForMediaResearched(series),
      horizontalPoster: this.setPosterHorizontalResearched(series, state),
      logo: series.srcLogo !== undefined ? series.srcLogo.toString() : undefined,
      horizontalPosterSameAsBackground: state,
      backgroundImage: series.srcBackgroundImage !== undefined ? series.srcBackgroundImage.toString() : undefined,
      seasons: []
    }
    if (!series.srcPosterNormal && !series.srcPosterSpecial && !series.srcPosterLicense) {
      newSeries.posters = this.getInitialPosters();
    }
    this.editSeriesSubject.next(newSeries);

    if (series.seasons.length <= 0) {
      this.editSeasonSubject.next([this.getNewSeason(this.editSeriesSubject.value.id, 1)])
    } else {
      const editSeasons: EditSeasonModel[] = [];
      series.seasons.forEach((season: SeasonModel) => {
        const editEpisodes: EditEpisodeModel[] = [];
        if (season.episodes.length <= 0) {
          editEpisodes.push(this.getNewEpisode(season.seriesId, 1));
        } else {
          season.episodes.forEach((episode: EpisodeModel) => {
            editEpisodes.push({
              id: episode.id,
              seasonId: episode.seasonId,
              jellyfinId: episode.jellyfinId,
              name: episode.name,
              episodeNumber: episode.episodeNumber,
              description: episode.description,
              date: episode.date ? new Date(episode.date) : new Date(),
              srcPoster: episode.srcPoster || undefined
            });
          });
        }
        editSeasons.push({
          id: season.id,
          seriesId: season.seriesId,
          jellyfinId: season.jellyfinId,
          name: season.name,
          seasonNumber: season.seasonNumber,
          srcPoster: season.srcPoster || undefined,
          episodes: editEpisodes
        });
      })
      this.editSeasonSubject.next(editSeasons);
    }
  }

  public setEditSeriesImmediatlyByIdSeries(id: number): void {
    this.seriesService.fetchSeasonsById(id).pipe(take(1)).subscribe((series: SeriesModel) => {
      this.setEditSeriesByResearch(series);
    });
  }

}
