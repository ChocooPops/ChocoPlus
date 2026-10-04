import { Component } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { catchError, defaultIfEmpty, forkJoin, map, of, Subscription, switchMap, take, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../main-appli-module/user-module/service/user/user.service';
import { ImagePreloaderService } from '../common-module/services/image-preloader/image-preloader.service';
import { UserModel } from '../main-appli-module/user-module/dto/user.model';
import { AuthService } from './services/auth/auth.service';
import { VersionService } from '../common-module/services/version/version.service';
import { VersionModel } from './models/version.interface';
import { BadVersionComponent } from './components/bad-version/bad-version.component';
import { NavigationButtonComponent } from '../main-appli-module/menu-module/components/navigation-button/navigation-button.component';
import { VerifUserAlreadyConnectedService } from './services/verif-user-already-connected/verif-user-already-connected.service';

@Component({
  selector: 'app-launch-page',
  standalone: true,
  imports: [RouterOutlet, BadVersionComponent, NavigationButtonComponent],
  templateUrl: './launch-page.component.html',
  styleUrls: ['./launch-page.component.css', '../../app/common-module/styles/loader.css']
})
export class LaunchPageComponent {

  srcLogo: string = 'icon/choco.svg';
  isLoading: boolean = true;
  isGoodVersion: boolean = false;
  lastVersion!: VersionModel;
  userAlreadyConnected!: boolean;

  private readonly subscription: Subscription = new Subscription();
  private readonly abortController: AbortController = new AbortController();

  constructor(private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly imagePreloaderService: ImagePreloaderService,
    private readonly authService: AuthService,
    private readonly versionService: VersionService,
    private readonly verifUserAlreadyConnectedService: VerifUserAlreadyConnectedService
  ) { }

  async ngOnInit(): Promise<void> {
    this.subscription.add(
      this.verifUserAlreadyConnectedService.getIfUserIsAlreadyConnected().subscribe((data: boolean) => {
        this.userAlreadyConnected = data;
      })
    )

    let currentVersion!: string;
    try {
      await this.authService.initFromSecureStore();
      currentVersion = await this.versionService.getCurrentVersion();
    } catch {
      if (this.abortController.signal.aborted) return;
      this.goTo('preload-offline-app');
      this.isGoodVersion = true;
      this.isLoading = false;
      return;
    }

    if (this.abortController.signal.aborted) return;

    this.subscription.add(
      this.userService.fetchCurrentUser().pipe(
        take(1),
        switchMap((user: UserModel | null | undefined) => {
          if (!user) {
            return throwError(() => new HttpErrorResponse({ status: 401 }));
          }
          return forkJoin({
            version: this.versionService.fetchLastVersion().pipe(
              take(1),
              catchError(() => of(null))
            ),
            synch: this.authService.fetchSynchTokenWithRoleByUser().pipe(
              take(1),
              defaultIfEmpty(undefined),
              catchError(() => of(undefined))
            )
          }).pipe(
            map(({ version }) => ({ user, version }))
          );
        })
      ).subscribe({
        next: (result: { user: UserModel, version: VersionModel | null }) => {
          if (result.version) {
            this.lastVersion = result.version;
            this.isGoodVersion = this.versionService.isVersionGreater(currentVersion, result.version.num);
          } else {
            this.isGoodVersion = true;
          }

          const img: string[] = [result.user.profilPhoto].filter((src): src is string => !!src);

          this.imagePreloaderService.preloadImages(img, this.abortController.signal)
            .catch(() => { /* Photo not preloaded: continuing */ })
            .finally(() => {
              if (this.abortController.signal.aborted) return;
              if (this.isGoodVersion) {
                this.router.navigateByUrl('preload-stream-app');
              }
              this.isLoading = false;
            });
        },
        error: (error: HttpErrorResponse) => {
          this.isGoodVersion = true;
          if (error.status === 401) {
            this.router.navigate(['login'], { relativeTo: this.route });
          } else {
            this.router.navigate(['preload-offline-app'], { relativeTo: this.route });
          }
          this.isLoading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setGoodVersion(): void {
    this.isGoodVersion = true;
  }

  private goTo(path: string): void {
    this.router.navigate([path], { relativeTo: this.route });
  }

}
