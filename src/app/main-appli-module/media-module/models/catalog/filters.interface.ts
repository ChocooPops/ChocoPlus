import { FilterType } from "./filter-type.enum";

export interface FILTERS {
    id: number,
    title: string,
    typeData: FilterType,
    operation: 'CONTAIN' | 'NOT_CONTAIN',
    value: {
        name: string,
        value: string | number
    }[]
}