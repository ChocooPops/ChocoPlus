import { MediaTypeModel } from "../../../media-module/models/media-type.enum"
import { ISO_3166_1 } from "../iso-3166-1.enum"
import { StateLibrary } from "./state-library.enum"

export interface Library {
    id: string,
    path: string,
    mediaType: MediaTypeModel,
    lang: ISO_3166_1,
    state: StateLibrary
    selected?: boolean,
}