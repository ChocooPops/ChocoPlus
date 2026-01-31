import { SelectionType } from "../../media-module/models/selection-type.enum";

export interface EditTypePoster {
    id: number,
    name: string,
    type: SelectionType,
    underId?: number
}