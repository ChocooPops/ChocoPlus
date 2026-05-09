import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TranslationLanguageService } from '../../../common-module/services/translation-language/translation-language.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService: AuthService = inject(AuthService);
    const languageService: TranslationLanguageService = inject(TranslationLanguageService);

    if (req.headers.has('skipInterceptor')) {
        const headers = req.headers.delete('skipInterceptor');
        const cloned = req.clone({ headers });
        return next(cloned);
    }

    //Ignorer les requêtes de traduction i18n
    if (req.url.includes('/i18n/')) {
        return next(req);
    }

    let token = authService.getToken();

    const headers: { [key: string]: string } = {};

    headers[environment.HEADER_NAME_FIELD_SECRET_API] = environment.HEADER_SECRET_API;
    headers['Accept-Language'] = languageService.getCurrentLangValue();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const cloned = req.clone({
        setHeaders: headers
    });

    return next(cloned);
};