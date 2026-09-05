import { SelectionType } from "../../media-module/models/selection-type.enum";

export interface EditSelectionModel {
    id: number,
    selectionType: SelectionType,
    isOrderRandom: boolean,
    name: string,
    mediaList: number[]
}