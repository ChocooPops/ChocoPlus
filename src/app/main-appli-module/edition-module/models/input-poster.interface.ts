import { SelectionType } from "../../media-module/models/selection-type.enum";

export interface InputPosterModel {
    id: number;
    srcPoster: string | ArrayBuffer | undefined | null;
    typePoster: {
        id: number,
        type_id: SelectionType
    }[];
}
