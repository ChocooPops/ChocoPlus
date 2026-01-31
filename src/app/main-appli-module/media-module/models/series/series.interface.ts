import { SeasonModel } from "./season.interface";
import { MediaModel } from "../media.interface";
import { MediaTypeModel } from "../media-type.enum";

export interface SeriesModel extends MediaModel {
    seasons: SeasonModel[]
    mediaType: MediaTypeModel.SERIES
}