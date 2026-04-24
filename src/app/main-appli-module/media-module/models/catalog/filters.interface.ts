import { FilterType } from "./filter-type.enum";
import { Operation } from "./operation.enum";

export interface FILTERS {
    id: number,
    title: string,
    typeData: FilterType,
    operation: Operation,
    value: {
        name: string,
        value: string | number
    }[]
}