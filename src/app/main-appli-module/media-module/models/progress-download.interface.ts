export interface ProgressDownload {
    key: string,
    percent: number,
    receivedBytes: number,
    totalBytes: number,
    fileName: string
}

export enum DownloadStatus {
    NOT_DOWNLOADED = 'NOT_DOWNLOADED',
    WAITING = 'WAITING',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED'
}