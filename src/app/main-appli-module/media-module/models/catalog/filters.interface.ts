import { JobModel } from "../job.eum";
import { FilterType } from "./filter-type.enum";
import { Operation } from "./operation.enum";

export interface FILTERS {
    id: number,
    typeData: FilterType | JobModel,
    operation: Operation,
    value: {
        name: string,
        value: string | number
    }[]
}