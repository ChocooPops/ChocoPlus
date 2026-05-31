import { JobModel } from "../job.eum";
import { FilterType } from "./filter-type.enum";
import { LogicalOperator } from "./logical-operator";
import { Operation } from "./operation.enum";

export interface FILTERS {
    id: number,
    typeData: FilterType | JobModel,
    operation: Operation,
    logic?: LogicalOperator,
    valueLogic?: LogicalOperator,
    value: {
        name: string,
        value: string | number
    }[]
}