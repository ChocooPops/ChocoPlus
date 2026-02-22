import { Injectable } from '@angular/core';
import { MediaProgressingModel } from '../../models/media-progressing.interface';
import { ProgressStateMedia } from '../../../media-module/models/progress-state-media.enum';

@Injectable({
  providedIn: 'root'
})
export class HistoricWatchProgressService {

  private historicMovieProgress: Map<number, MediaProgressingModel> = new Map();
  private historicEpisodeProgress: Map<number, MediaProgressingModel> = new Map();

  public getHistoricMovieProgressById(movieId: number, watchProgress: number, stateProgress: ProgressStateMedia): MediaProgressingModel {
    const historic = this.historicMovieProgress.get(movieId);
    if (historic) {
      return historic;
    }
    const newHistoric: MediaProgressingModel = {
      mediaId: movieId,
      watchProgress: watchProgress,
      stateProgress: stateProgress
    };
    this.historicMovieProgress.set(movieId, newHistoric);
    return newHistoric;
  }

  public getHistoricEpisodeProgressById(episodeId: number, watchProgress: number, stateProgress: ProgressStateMedia): MediaProgressingModel {
    const historic = this.historicEpisodeProgress.get(episodeId);
    if (historic) {
      return historic;
    }
    const newHistoric: MediaProgressingModel = {
      mediaId: episodeId,
      watchProgress: watchProgress,
      stateProgress: stateProgress
    };
    this.historicEpisodeProgress.set(episodeId, newHistoric);
    return newHistoric;
  }

  public updateHistoricMovieById(movieId: number, watchProgress: number, stateProgress: ProgressStateMedia): void {
    const historic = this.historicMovieProgress.get(movieId);
    if (historic) {
      historic.watchProgress = watchProgress;
      historic.stateProgress = stateProgress;
    } else {
      this.getHistoricMovieProgressById(movieId, watchProgress, stateProgress);
    }
  }

  public updateHistoricEpisodeById(episodeId: number, watchProgress: number, stateProgress: ProgressStateMedia): void {
    const historic = this.historicEpisodeProgress.get(episodeId);
    if (historic) {
      historic.watchProgress = watchProgress;
      historic.stateProgress = stateProgress;
    } else {
      this.getHistoricMovieProgressById(episodeId, watchProgress, stateProgress);
    }
  }

}
