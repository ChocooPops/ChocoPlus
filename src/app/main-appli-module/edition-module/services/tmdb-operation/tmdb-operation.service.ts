import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EditMovieModel } from '../../models/edit-movie.interface';
import { EditSeriesModel } from '../../models/series/edit-series.interface';
import { EditSeasonModel } from '../../models/series/edit-season.interface';
import { EditEpisodeModel } from '../../models/series/edit-episode.interface';

@Injectable({
  providedIn: 'root'
})
export class TmdbOperationService {

  private readonly apiUrlAi: string = `${environment.apiUrlTmdb}`;
  private readonly apiUrlSearchMovieByTmdb: string = 'search-movie-tmdb';
  private readonly apiUrlSearchMovieByJellyfin: string = 'search-movie-jellyfin';
  private readonly apiUrlSearchSeriesByTmdb: string = 'search-series-tmdb';
  private readonly apiUrlSearchSeriesJellyfin: string = 'search-series-jellyfin';

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

  public fetchSearchMovieInfoByByJellyfinDataBase(jellyfinId: string, id: number, edit: EditMovieModel | undefined = undefined): Observable<EditMovieModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchMovieByJellyfin}/${jellyfinId}`).pipe(
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

  public fetchSearchSeriesInfoByTmdbDataBase(title: string, id: number, edit: EditSeriesModel): Observable<EditSeriesModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchSeriesByTmdb}/${title}`).pipe(
      map((data: EditSeriesModel) => {
        const editSeries: EditSeriesModel = data;
        editSeries.date = editSeries.date ? new Date(editSeries.date) : new Date();
        editSeries.seasons.forEach((seasons: EditSeasonModel) => {
          seasons.episodes.forEach((episode: EditEpisodeModel) => {
            episode.date = episode.date ? new Date(episode.date) : new Date();
          });
        });
        editSeries.startShow = edit.startShow;
        editSeries.endShow = edit.endShow;
        editSeries.id = id;
        return editSeries;
      })
    )
  }

  public fetchSearchSeriesInfoByJellyfin(title: string, id: number, edit: EditSeriesModel, editSeasons: EditSeasonModel[], modifyMetaData: boolean): Observable<EditSeriesModel> {
    return this.http.get<any>(`${this.apiUrlAi}/${this.apiUrlSearchSeriesJellyfin}/${title}`).pipe(
      map((data: EditSeriesModel) => {
        const editSeries: EditSeriesModel = data;
        editSeries.date = editSeries.date ? new Date(editSeries.date) : new Date();
        editSeries.seasons.forEach((seasons: EditSeasonModel) => {
          seasons.episodes.forEach((episode: EditEpisodeModel) => {
            episode.date = episode.date ? new Date(episode.date) : new Date();
          });
        })
        editSeries.startShow = edit.startShow;
        editSeries.endShow = edit.endShow;
        editSeries.id = id;

        if(modifyMetaData) {
          if (edit.posters.length > 0 && edit.posters[0].srcPoster) {
            editSeries.posters = edit.posters;
          }
          if (edit.horizontalPoster.length && edit.horizontalPoster[0].srcPoster) {
            editSeries.horizontalPoster = edit.horizontalPoster;
          }
          if (edit.logo) {
            editSeries.logo = edit.logo;
          }
          if (edit.backgroundImage) {
            editSeries.backgroundImage = edit.backgroundImage;
          }

          const allEpisodes: EditEpisodeModel[] = [];
          editSeasons.forEach((season: EditSeasonModel) => {
            allEpisodes.push(...season.episodes);
          });

          editSeries.seasons.forEach((season: EditSeasonModel, seasonIndex: number) => {
            const seasonTmp : EditSeasonModel | undefined = editSeasons.find((item : EditSeasonModel) => item.jellyfinId === season.jellyfinId);
            if (seasonTmp) {
              editSeries.seasons[seasonIndex].id = seasonTmp.id;
              if(seasonTmp.name && seasonTmp.name.trim() !== '') {
                editSeries.seasons[seasonIndex].name = seasonTmp.name;
              }
              if(seasonTmp.srcPoster) {
                editSeries.seasons[seasonIndex].srcPoster = seasonTmp.srcPoster;
              }
            }
            season.episodes.forEach((episode : EditEpisodeModel, episodeIndex: number) => {
              const episodeTmp : EditEpisodeModel | undefined = allEpisodes.find((item : EditEpisodeModel) => item.jellyfinId === episode.jellyfinId);
              if (episodeTmp) {
               editSeries.seasons[seasonIndex].episodes[episodeIndex].id = episodeTmp.id;
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
              }
            });
          });
        }
        return editSeries;
      })
    )
  }

}
