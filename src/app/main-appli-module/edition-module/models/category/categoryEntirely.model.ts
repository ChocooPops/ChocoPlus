import { MovieModel } from "../../../media-module/models/movie-model";
import { SeriesModel } from "../../../media-module/models/series/series.interface";

export interface CategoryEntirelyModel {
    id: number,
    tmdbId: number | undefined,
    translationKey: string,
    translatedName: string,
    nameSelection: string,
    movies: MovieModel[],
    series : SeriesModel[]
}