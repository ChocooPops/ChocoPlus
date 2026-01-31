export interface EditLicenseModel {
    id: number,
    name: String,
    position: boolean,
    srcIcon: string | ArrayBuffer | undefined | null,
    srcLogo: string | ArrayBuffer | undefined | null,
    srcBackground: string | ArrayBuffer | undefined | null,
    mediaList: number[],
    selectionList: number[]
}