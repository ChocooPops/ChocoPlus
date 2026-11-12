import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { SeasonModel } from '../../../media-module/models/series/season.interface';

export interface NextEpisodeModel {
  episode: EpisodeModel,
  // Index of its season in the series' seasons (-1: unknown)
  seasonIndex: number,
  seasonNumber: number | null
}

export interface NextEpisodeSource {
  // null: seasons unknown, only the current season is looked at
  seasons: SeasonModel[] | null,
  getEpisodes(seasonId: number): Promise<EpisodeModel[]>,
  // Offline: seasons flagged without downloaded episode are skipped
  skipEmptySeasons: boolean
}

const byEpisodeNumber = (a: EpisodeModel, b: EpisodeModel): number => a.episodeNumber - b.episodeNumber;

// The episode after this one: the next of its season, otherwise the first of the following season
// (by season number, so the specials of a "season 0" never come after the last season).
export async function findNextEpisode(seasonId: number, episodeId: number, source: NextEpisodeSource): Promise<NextEpisodeModel | null> {
  const seasons = source.seasons ?? [];
  const seasonIndex = seasons.findIndex((season) => season.id === seasonId);
  const episodes = [...await source.getEpisodes(seasonId)].sort(byEpisodeNumber);
  const position = episodes.findIndex((episode) => episode.id === episodeId);
  if (position < 0) return null;

  if (position + 1 < episodes.length) {
    return {
      episode: episodes[position + 1],
      seasonIndex,
      seasonNumber: seasonIndex >= 0 ? seasons[seasonIndex].seasonNumber : null
    };
  }
  if (seasonIndex < 0) return null;

  const currentNumber = seasons[seasonIndex].seasonNumber;
  const followingSeasons = seasons
    .map((season, index) => ({ season, index }))
    .filter(({ season }) => season.seasonNumber > currentNumber && !(source.skipEmptySeasons && season.hasNoEpisodes))
    .sort((a, b) => a.season.seasonNumber - b.season.seasonNumber);

  for (const { season, index } of followingSeasons) {
    const seasonEpisodes = [...await source.getEpisodes(season.id)].sort(byEpisodeNumber);
    if (seasonEpisodes.length > 0) {
      return { episode: seasonEpisodes[0], seasonIndex: index, seasonNumber: season.seasonNumber };
    }
  }
  return null;
}
