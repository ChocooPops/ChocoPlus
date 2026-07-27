export interface EditNewsVideoRunningModel {
    id: number,
    mediaId: number,
    mediaLibraryId: string | undefined,
    srcBackground: string | undefined,
    startShow: string,
    activated: boolean,
    endShow: string,
}