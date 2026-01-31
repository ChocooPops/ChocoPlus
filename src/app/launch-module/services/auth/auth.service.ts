import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TokenModel } from '../../models/token.model';
import { LoginModel } from '../../models/login.model';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { UserService } from '../../../main-appli-module/user-module/service/user/user.service';
import { UserModel } from '../../../main-appli-module/user-module/dto/user.model';
import { RoleModel } from '../../../common-module/models/role.enum';
import { MessageReturnedModel } from '../../../common-module/models/message-returned.interface';
import { RegisterModel } from '../../models/register.model';

declare global {
  interface Window {
    electron?: {
      setRefreshToken(token: any): Promise<void>;
      getRefreshToken(): Promise<string | null>;
      deleteRefreshToken(): Promise<void>;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrlAuth = environment.apiUrlAuth;

  // Access token uniquement en mémoire
  private accessToken: string | null = null;

  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) { }

  /**
   * LOGIN :
   * - garde l'access token en mémoire
   * - stocke le refresh token (ou fallback: access) via keytar (preload.secureStore)
   */
  public fetchLogin(auth: LoginModel) {
    return this.http.post<TokenModel>(`${this.apiUrlAuth}/login`, auth).pipe(
      // data doit idéalement contenir { access_token, refresh_token }
      mergeMap((data: TokenModel) => {
        // 1) access token -> mémoire
        if (data?.access_token) this.setAccessToken(data.access_token);
        // 2) refresh token -> keytar
        const toStore = (data as any)?.refresh_token ?? data?.access_token ?? '';
        if (toStore && window.electron?.setRefreshToken) {
          return of(null).pipe(
            mergeMap(() => window.electron!.setRefreshToken(toStore)),
            map(() => void 0)
          );
        }
        return of(void 0);
      }),
      catchError((error) => { throw error; })
    );
  }

  /** Initialisation au démarrage : si un refresh token est en keytar, tente un /refresh */
  public async initFromSecureStore(): Promise<void> {
    const rft = await window.electron?.getRefreshToken?.() || null;
    this.setAccessToken(rft);
  }

  /** Définir l'access token (mémoire) */
  private setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  /** Récupérer l'access token (mémoire) pour l'interceptor */
  getToken(): string | null {
    return this.accessToken;
  }

  /** Décoder le JWT courant (depuis la mémoire) */
  private decodeToken(): any {
    const token = this.accessToken;
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  /** Auth check */
  isAuthenticated(): boolean {
    const token = this.accessToken;
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const user = this.decodeToken();
      const currentUser: UserModel | undefined = this.userService.getCurrentUserValue();
      return !!(user && currentUser
        && user.role !== RoleModel.NOT_ACTIVATE && currentUser.role !== RoleModel.NOT_ACTIVATE
        && user.role !== RoleModel.SUSPENDED && currentUser.role !== RoleModel.SUSPENDED);
    }
    return false;
  }

  /** Admin check */
  isAdmin(): boolean {
    const user = this.decodeToken();
    const currentUser: UserModel | undefined = this.userService.getCurrentUserValue();
    return !!(user && currentUser && user.role === RoleModel.ADMIN && currentUser.role === RoleModel.ADMIN);
  }

  /**
   * LOGOUT :
   * - notif au back (optionnel)
   * - supprime le refresh token de keytar
   * - purge l'access token mémoire
   */
  async logout(): Promise<void> {
    await window.electron?.deleteRefreshToken?.();
    this.setAccessToken(null);
    this.userService.resetCurrentUser();
    this.router.navigateByUrl('login');
  }

  private readonly urlRegister: string = 'register';
  private readonly urlSendVerificationCode: string = 'send-verification-code';
  private readonly urlReSendVerificationCode: string = 'resend-verification-code';

  public fetchSendVerificationCode(user: RegisterModel): Observable<MessageReturnedModel> {
    return this.http.post<any>(`${this.apiUrlAuth}/${this.urlSendVerificationCode}`, user).pipe(
      map((data: MessageReturnedModel) => {
        return data;
      })
    )
  }

  public fetchValidateVerificationCode(code: number, email: string): Observable<MessageReturnedModel> {
    return this.http.post<any>(`${this.apiUrlAuth}/${this.urlRegister}`, { verificationCode: code, email: email }).pipe(
      map((data: MessageReturnedModel) => {
        return data;
      })
    )
  }

  public fetchReSendVerificationCode(email: string): Observable<MessageReturnedModel> {
    return this.http.post<any>(`${this.apiUrlAuth}/${this.urlReSendVerificationCode}`, { email: email }).pipe(
      map((data: MessageReturnedModel) => {
        return data;
      })
    )
  }
}
