import { EditSeasonModel } from "./edit-season.interface";
import { EditionMediaModel } from "../edition-media.interface";

export interface EditSeriesModel extends EditionMediaModel {
    seasons: EditSeasonModel[]
}