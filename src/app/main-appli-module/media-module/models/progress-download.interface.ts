export interface ProgressDownload {
    key: string,
    percent: number,
    receivedBytes: number,
    totalBytes: number,
    fileName: string,
    type: ProgressTypeOperation
}

export interface HistoricProgressView extends ProgressDownload {
  speedLabel: string;
  remainingLabel: string;
}

export enum DownloadStatus {
    NOT_DOWNLOADED = 'NOT_DOWNLOADED',
    WAITING = 'WAITING',
    IN_PROGRESS = 'IN_PROGRESS',
    DOWNLOADED = 'DOWNLOADED',
    DELETION = 'DELETION'
}

export enum ProgressTypeOperation {
    DOWNLOAD = 'DOWNLOAD',
    DELETION = 'DELETION'
}