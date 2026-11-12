import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { DownloadService } from '../../../media-module/services/download/download.service';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { PlayerLaunchRequest } from '../../models/player.interface';
import { NextEpisodeModel, findNextEpisode } from './next-episode';

export interface NextEpisodeResult extends NextEpisodeModel {
  // The series with its seasons, for the episodes menu of the next episode
  series: SeriesModel | undefined
}

@Injectable({
  providedIn: 'root'
})
export class NextEpisodeService {

  constructor(private readonly seriesService: SeriesService,
    private readonly downloadService: DownloadService
  ) { }

  // Online: the episodes of the server. Offline: the downloaded ones.
  public async find(request: PlayerLaunchRequest): Promise<NextEpisodeResult | null> {
    if (request.mediaType !== MediaTypeModel.SERIES || request.episodeId <= 0) return null;
    const online = request.isConnected;

    let series = request.media as SeriesModel | undefined;
    if (!series?.seasons?.length && online) {
      const fetched = await firstValueFrom(this.seriesService.fetchSeasonsById(request.mediaId)).catch(() => undefined);
      // On error, the service answers with a placeholder series of id 0
      series = fetched && fetched.id > 0 ? fetched : undefined;
    }

    const getEpisodes = (seasonId: number): Promise<EpisodeModel[]> => firstValueFrom(online
      ? this.seriesService.fetchEpisodesBySeriesAndSeasonId(request.mediaId, seasonId)
      : this.downloadService.readAllEpisodesFromSeriesAndSeasonId(request.mediaId, seasonId)
    ).then((episodes) => episodes ?? []).catch(() => []);

    try {
      const next = await findNextEpisode(request.seasonId, request.episodeId, {
        seasons: series?.seasons?.length ? series.seasons : null,
        getEpisodes,
        skipEmptySeasons: !online
      });
      return next ? { ...next, series } : null;
    } catch {
      return null;
    }
  }
}
