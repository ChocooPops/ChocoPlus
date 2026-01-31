import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService : AuthService = inject(AuthService);

    if (req.headers.has('skipInterceptor')) {
        const headers = req.headers.delete('skipInterceptor');
        const cloned = req.clone({ headers });
        return next(cloned);
    }

    let token = authService.getToken();
    
    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};