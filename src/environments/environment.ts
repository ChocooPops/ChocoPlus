declare const window: any;

const apiUrl: string = window.electron.apiUrl;
const headerSecret: string = window.electron?.headerSecret || 'SF76KE6eNKz9Y6hQYFtz7fC8h3XG8848KQNPmergSF76KE6eNKz9Y6hQYFtz7fC8h3XG8848KQNPmerg';
const headerName: string = window.electron?.headerName || 'X-API-Secret-Key-Choco-Plus';

export const environment = {
    apiUrlAuth: apiUrl + '/auth',
    apiUrlMedia: apiUrl + '/media',
    apiUrlMovie: apiUrl + '/movie',
    apiUrlSeries: apiUrl + '/series',
    apiUrlSelection: apiUrl + '/selection',
    apirUrlLicense: apiUrl + '/license',
    apiUrlStream: apiUrl + '/stream',
    apiUrlUser: apiUrl + '/user',
    apiUrlCategory: apiUrl + '/category',
    apiUrlTmdb: apiUrl + '/tmdb',
    apiUrlSimilarTitle: apiUrl + '/similar-title',
    apiProfilPicture: apiUrl + '/profil-photo',
    apiJellyfin: apiUrl + '/jellyfin',
    apiSupport: apiUrl + '/support',
    apiNews: apiUrl + '/news',
    apiUrlNewsVideoRunning: apiUrl + '/news-video-running',
    access_token: 'access_token',
    HEADER_SECRET_API: headerSecret,
    HEADER_NAME_FIELD_SECRET_API: headerName
}