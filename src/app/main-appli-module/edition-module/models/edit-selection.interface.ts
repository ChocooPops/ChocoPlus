import { SelectionType } from "../../media-module/models/selection-type.enum";

export interface EditSelectionModel {
    id: number,
    selectionType: SelectionType,
    name: string,
    mediaList: number[]
}