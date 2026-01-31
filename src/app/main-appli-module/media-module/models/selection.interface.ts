import { MediaModel } from "./media.interface"
import { SelectionType } from "./selection-type.enum"

export interface SelectionModel {
    id: number,
    typeSelection: SelectionType,
    name: string,
    mediaList: MediaModel[]
}