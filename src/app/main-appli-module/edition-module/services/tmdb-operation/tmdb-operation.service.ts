import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EditMovieModel } from '../../models/edit-movie.interface';
import { EditSeriesModel } from '../../models/series/edit-series.interface';
import { EditSeasonModel } from '../../models/series/edit-season.interface';
import { EditEpisodeModel } from '../../models/series/edit-episode.interface';
import { EditCreditModel } from '../../models/edit-credit.interface';

@Injectable({
  providedIn: 'root'
})
export class TmdbOperationService {

  private readonly apiUrlAi: string = `${environment.apiUrlTmdb}`;
  private readonly apiUrlSearchMovieByTmdb: string = 'search-movie-tmdb';
  private readonly apiUrlSearchMovieByMediaLibrary: string = 'search-movie-library';
  private readonly apiUrlSearchSeriesByTmdb: string = 'search-series-tmdb';
  private readonly apiUrlSearchSeriesByMediaLibrary: string = 'search-series-library';
  private readonly apiUrlSearchCreditById: string = 'search-credit-by-id';
  private readonly apiUrlSearchCreditByFullName: string = 'search-credit-by-full-name';

  constructor(private http: HttpClient) { }

  public fetchSearchMovieInfoByTmdbDataBase(title: string, id: number, edit: EditMovieModel | undefined = undefined): Observable<EditMovieModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchMovieByTmdb}/${title}`).pipe(
      map((data: EditMovieModel) => {
        const editMovie: EditMovieModel = data;
        editMovie.id = id;
        editMovie.date = new Date(editMovie.date);
        if (edit) {
          if (edit.posters.length > 0 && edit.posters[0].srcPoster) {
            editMovie.posters = edit.posters;
          }
          if (edit.horizontalPoster.length && edit.horizontalPoster[0].srcPoster) {
            editMovie.horizontalPoster = edit.horizontalPoster;
          }
          if (edit.logo) {
            editMovie.logo = edit.logo;
          }
          if (edit.backgroundImage) {
            editMovie.backgroundImage = edit.backgroundImage;
          }
          editMovie.startShow = edit.startShow;
          editMovie.endShow = edit.endShow;
          editMovie.horizontalPosterSameAsBackground = edit.horizontalPosterSameAsBackground;
        }
        return editMovie;
      })
    )
  }

  public fetchSearchMovieInfoByMediaLibrary(mediaLibraryId: string, id: number, edit: EditMovieModel | undefined = undefined): Observable<EditMovieModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchMovieByMediaLibrary}/${mediaLibraryId}`).pipe(
      map((data: EditMovieModel) => {
        const editMovie: EditMovieModel = data;
        editMovie.id = id;
        editMovie.date = new Date(editMovie.date);
        if (edit) {
          if (edit.posters.length > 0 && edit.posters[0].srcPoster) {
            editMovie.posters = edit.posters;
          }
          if (edit.horizontalPoster.length && edit.horizontalPoster[0].srcPoster) {
            editMovie.horizontalPoster = edit.horizontalPoster;
          }
          if (edit.logo) {
            editMovie.logo = edit.logo;
          }
          if (edit.backgroundImage) {
            editMovie.backgroundImage = edit.backgroundImage;
          }
          editMovie.startShow = edit.startShow;
          editMovie.endShow = edit.endShow;
          editMovie.horizontalPosterSameAsBackground = edit.horizontalPosterSameAsBackground;
        }
        return editMovie;
      })
    )
  }

  private setEditSeries(id: number, editSeries: EditSeriesModel, editTmp: EditSeriesModel, editSeasonsTmp: EditSeasonModel[]): EditSeriesModel {
    editSeries.date = editSeries.date ? new Date(editSeries.date) : new Date();
    editSeries.seasons.forEach((seasons: EditSeasonModel) => {
      seasons.episodes.forEach((episode: EditEpisodeModel) => {
        episode.date = episode.date ? new Date(episode.date) : new Date();
      });
    });
    editSeries.startShow = editTmp.startShow;
    editSeries.endShow = editTmp.endShow;
    editSeries.id = id;

    if (editTmp.id > 1) {
      if (editTmp.posters.length > 0 && editTmp.posters[0].srcPoster) {
            editSeries.posters = editTmp.posters;
      }
      if (editTmp.horizontalPoster.length && editTmp.horizontalPoster[0].srcPoster) {
        editSeries.horizontalPoster = editTmp.horizontalPoster;
      }
      if (editTmp.logo) {
        editSeries.logo = editTmp.logo;
      }
      if (editTmp.backgroundImage) {
        editSeries.backgroundImage = editTmp.backgroundImage;
      }
      editSeries.horizontalPosterSameAsBackground = editTmp.horizontalPosterSameAsBackground;

      const allEpisodes: EditEpisodeModel[] = [];
        editSeasonsTmp.forEach((season: EditSeasonModel) => {
          allEpisodes.push(...season.episodes);
      });

      editSeries.seasons.forEach((season: EditSeasonModel, seasonIndex: number) => {
        const seasonTmp : EditSeasonModel | undefined = editSeasonsTmp.find((item : EditSeasonModel) => item.mediaLibraryId === season.mediaLibraryId);
        if (seasonTmp) {
          if(seasonTmp.name && seasonTmp.name.trim() !== '') {
            editSeries.seasons[seasonIndex].name = seasonTmp.name;
          }
          if(seasonTmp.srcPoster) {
            editSeries.seasons[seasonIndex].srcPoster = seasonTmp.srcPoster;
          }
          if(seasonTmp.path) {
            editSeries.seasons[seasonIndex].path = seasonTmp.path;
          }
        }
        season.episodes.forEach((episode : EditEpisodeModel, episodeIndex: number) => {
          const episodeTmp : EditEpisodeModel | undefined = allEpisodes.find((item : EditEpisodeModel) => item.mediaLibraryId === episode.mediaLibraryId);
          if (episodeTmp) {
            if (episodeTmp.name && episodeTmp.name.trim() !== '') {
              editSeries.seasons[seasonIndex].episodes[episodeIndex].name = episodeTmp.name;
            }
            if (episodeTmp.srcPoster) {
              editSeries.seasons[seasonIndex].episodes[episodeIndex].srcPoster = episodeTmp.srcPoster;
            }
            if (episodeTmp.description && episodeTmp.description.trim() !== '') {
              editSeries.seasons[seasonIndex].episodes[episodeIndex].description = episodeTmp.description;
            }
            if (episodeTmp.date) {
              editSeries.seasons[seasonIndex].episodes[episodeIndex].date = new Date(episodeTmp.date);
            }
            if (episodeTmp.path) {
              editSeries.seasons[seasonIndex].episodes[episodeIndex].path = episodeTmp.path;
            }
          }
        });
      });
    }
    return editSeries;
  }

  public fetchSearchSeriesInfoByTmdbDataBase(title: string, id: number, editTmp: EditSeriesModel, editSeasonsTmp: EditSeasonModel[]): Observable<EditSeriesModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchSeriesByTmdb}/${title}`).pipe(
      map((data: EditSeriesModel) => {
        const editSeries: EditSeriesModel = data;
        return this.setEditSeries(id, editSeries, editTmp, editSeasonsTmp);
      })
    )
  }

  public fetchSearchSeriesInfoByMediaLibrary(mediaLibraryId: string, id: number, editTmp: EditSeriesModel, editSeasonsTmp: EditSeasonModel[]): Observable<EditSeriesModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchSeriesByMediaLibrary}/${mediaLibraryId}`).pipe(
      map((data: EditSeriesModel) => {
        const editSeries: EditSeriesModel = data;
        return this.setEditSeries(id,editSeries, editTmp, editSeasonsTmp);
      })
    )
  }

  public fetchSearchCreditByTmdbId(tmdbId: number, editCredit: EditCreditModel): Observable<EditCreditModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchCreditById}/${tmdbId}`).pipe(
      map((data: EditCreditModel) => {
        data.id = editCredit.id;
        return data;
      })
    )
  }

  public fetchSearchCreditByFullName(fullName: string, editCredit: EditCreditModel): Observable<EditCreditModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchCreditByFullName}/${fullName}`).pipe(
      map((data: EditCreditModel) => {
        data.id = editCredit.id;
        return data;
      })
    )
  }

}
