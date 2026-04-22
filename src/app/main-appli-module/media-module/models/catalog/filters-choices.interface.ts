import { FilterType } from "./filter-type.enum";
import { FilterChoiceModel } from "./filter-choice.interface";

export interface FiltersChoicesModel {
    name: string,
    type: FilterType,
    filters: FilterChoiceModel[]
}