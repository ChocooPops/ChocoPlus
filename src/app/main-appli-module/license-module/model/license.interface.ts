import { SelectionModel } from "../../media-module/models/selection.interface"

export interface LicenseModel {
    id: number,
    name: string,
    position?: boolean | undefined
    srcIcon?: string | ArrayBuffer | undefined | null,
    srcLogo?: string | ArrayBuffer | undefined | null,
    srcBackground?: string | ArrayBuffer | undefined | null,
    selectionList: SelectionModel[],
    visited: boolean
}
