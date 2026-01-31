import { MediaTypeModel } from "./media-type.enum";
import { MediaModel } from "./media.interface";

export interface MovieModel extends MediaModel {
    time?: number,
    quality?: string,
    mediaType: MediaTypeModel.MOVIE
}
