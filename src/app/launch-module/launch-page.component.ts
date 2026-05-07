import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../main-appli-module/user-module/service/user/user.service';
import { ImagePreloaderService } from '../common-module/services/image-preloader/image-preloader.service';
import { UserModel } from '../main-appli-module/user-module/dto/user.model';
import { AuthService } from './services/auth/auth.service';
import { VersionService } from '../common-module/services/version/version.service';
import { VersionModel } from './models/version.interface';
import { BadVersionComponent } from './components/bad-version/bad-version.component';

@Component({
  selector: 'app-launch-page',
  standalone: true,
  imports: [RouterOutlet, BadVersionComponent],
  templateUrl: './launch-page.component.html',
  styleUrls: ['./launch-page.component.css', '../../app/common-module/styles/loader.css']
})
export class LaunchPageComponent {

  srcLogo: string = 'icon/choco.svg';
  isLoading: boolean = true;
  isGoodVersion: boolean = false;
  lastVersion!: VersionModel;

  constructor(private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly imagePreloaderService: ImagePreloaderService,
    private readonly authService: AuthService,
    private readonly versionService: VersionService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.authService.initFromSecureStore();
    const currentVersion: string = await this.versionService.getCurrentVersion();
    forkJoin({
      user: this.userService.fetchCurrentUser(),
      version: this.versionService.fetchLastVersion()
    })
    .pipe(take(1))
    .subscribe({
      next: ((result: {
          user: UserModel,
          version: VersionModel | null
        }) => {
          if (result.version) {
            this.lastVersion = result.version;
            this.isGoodVersion = this.versionService.isVersionGreater(currentVersion, this.lastVersion.num);
          } else {
            this.isGoodVersion = true;
          }
          this.imagePreloaderService.preloadImages([result.user.profilPhoto]).finally(() => {
            if (this.isGoodVersion) {
              this.router.navigateByUrl('preload-stream-app');
            }
            this.isLoading = false;
          });
        }),
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
  }

  setGoodVersion(): void {
    this.isGoodVersion = true;
  }

}
