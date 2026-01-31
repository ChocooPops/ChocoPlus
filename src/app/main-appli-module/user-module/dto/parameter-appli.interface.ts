import { SimpleModel } from "../../../common-module/models/simple-model";

export interface ParamaterAppliModel {
    id: number,
    name: string,
    radioButton: SimpleModel[],
    call: any
}