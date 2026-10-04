import { Component } from '@angular/core';
import { UserService } from '../../../main-appli-module/user-module/service/user/user.service';
import { catchError, defaultIfEmpty, EMPTY, map, Observable, of, Subscription, switchMap, take } from 'rxjs';
import { UserModel } from '../../../main-appli-module/user-module/dto/user.model';
import { ButtonFormComponent } from '../button-form/button-form.component';
import { TypeButtonModel } from '../../models/type-button.model';
import { AuthService } from '../../services/auth/auth.service';
import { ElectronService } from '../../../common-module/services/electron/electron.service';
import { LoadOpeningPageService } from '../../services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../models/page.enum';
import { TitleCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MediaModel } from '../../../main-appli-module/media-module/models/media.interface';

@Component({
  selector: 'app-preload-main-appli',
  standalone: true,
  imports: [ButtonFormComponent, TitleCasePipe, TranslatePipe],
  templateUrl: './preload-main-app.component.html',
  styleUrls: ['./preload-main-app.component.css', '../../../common-module/styles/loader.css']
})
export class PreloadMainAppComponent {

  srcPP!: string;
  pseudo!: string;
  subscription: Subscription = new Subscription();
  transitionPP: boolean = false;
  
  public readonly TypeButton = TypeButtonModel;
  public readonly nameButtonLogin = 'LAUNCH.LOGOUT';
  public readonly srcDefaultPp: string = 'pp/pp.jpg';

  public activateLoader: boolean = false;
  private isLoggingOut: boolean = false;

  constructor(private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly electronService: ElectronService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getCurrentUser().pipe(
        take(1),
        switchMap((user: UserModel | undefined) => {
          if (!user) {
            this.router.navigate(['login'], { relativeTo: this.route });
            return EMPTY;
          }
          return this.userService.fetchMyMediaListByUserId().pipe(
            take(1),
            defaultIfEmpty(null),
            catchError(() => of(null)),
            map(() => ({ user }))
          );
        })
      ).subscribe(({ user }) => {
        this.srcPP = user.profilPhoto;
        this.pseudo = user.pseudo;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onClickProfil(): void {
    this.transitionPP = !this.transitionPP;
    if (this.activateLoader || this.isLoggingOut) return;
    this.activateLoader = true;
    const page: PageModel = this.loadOpeningPageService.getOpeningPage();
    const pageSelected: PageModel = page === PageModel.DEFAULT_PAGE ? this.loadOpeningPageService.getLastPageVisited() : page;
    this.subscription.add(
        this.loadPage(pageSelected).subscribe()
    )
  }

  private loadPage(page: PageModel): Observable<void> {
    switch (page) {
      case PageModel.PAGE_RESEARCH: return this.loadOpeningPageService.loadResearchPageDataAndNavigate();
      case PageModel.PAGE_MOVIE:    return this.loadOpeningPageService.loadMoviePageDataAndNavigate();
      case PageModel.PAGE_SERIES:   return this.loadOpeningPageService.loadSeriesPageDataAndNavigate();
      case PageModel.PAGE_CATALOG:  return this.loadOpeningPageService.loadCatalogPageDataAndNavigate();
      case PageModel.PAGE_MYLIST:   return this.loadOpeningPageService.loadMyListPageDataAndNavigate();
      case PageModel.PAGE_DOWNLOAD: return this.loadOpeningPageService.loadDownloadPageDataAndNavigate();
      case PageModel.PAGE_EDITION:  return this.loadOpeningPageService.loadEditionPageDataAndNavigate();
      case PageModel.PAGE_USER:     return this.loadOpeningPageService.loadUserPageDataAndNavigate();
      case PageModel.PAGE_LICENSE:  return this.loadOpeningPageService.loadLicensePageDataAndNavigate();
      default:                      return this.loadOpeningPageService.loadHomePageDataAndNavigate();
    }
}

  async onLogout(): Promise<void> {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    try {
      await this.authService.logout();
      await this.electronService.deleteCacheAndCookies();
    } finally {
      this.electronService.reloadWindow();
    }
  }

  errorPpUser(): void {
    this.srcPP = this.srcDefaultPp;
  }

}
