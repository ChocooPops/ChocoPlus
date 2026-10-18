declare const window: any;

const apiUrl: string = window.electron?.apiUrl || '';
const headerSecret: string = window.electron?.headerSecret || '';
const headerName: string = window.electron?.headerName || '';

export const environment = {
    apiUrl: apiUrl,
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
    apiSupport: apiUrl + '/support',
    apiNews: apiUrl + '/news',
    apiUrlNewsVideoRunning: apiUrl + '/news-video-running',
    apiUrlStatUser: apiUrl + '/stat-user',
    apiUrlDocumentation: apiUrl + '/documentation',
    apiUrlCredit: apiUrl + '/credit',
    apiUrlVersion: apiUrl + '/version',
    apiUrlLibrary: apiUrl + '/library',
    access_token: 'access_token',
    HEADER_SECRET_API: headerSecret,
    HEADER_NAME_FIELD_SECRET_API: headerName
}