import { Component } from '@angular/core';
import { UserService } from '../../../main-appli-module/user-module/service/user/user.service';
import { Subscription, take } from 'rxjs';
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
  activateLoader: boolean = false;
  transitionPP: boolean = false;
  TypeButton = TypeButtonModel;
  nameButtonLogin = 'LAUNCH.LOGOUT';

  constructor(private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly electronService: ElectronService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().pipe(take(1)).subscribe((user: UserModel | undefined) => {
      if (user) {
        this.srcPP = user.profilPhoto;
        this.pseudo = user.pseudo;
      } else {
        this.router.navigate(['login'], { relativeTo: this.route });
      }
    });
    this.userService.fetchMyMediaListByUserId().pipe(take(1)).subscribe(data => { });
  }

  onClickProfil(): void {
    this.transitionPP = !this.transitionPP;
    if (!this.activateLoader) {
      const page: PageModel = this.loadOpeningPageService.getOpeningPage();
      if (page === PageModel.DEFAULT_PAGE) {
        const pageDefault : PageModel = this.loadOpeningPageService.getLastPageVisited();
        this.loadPage(pageDefault);
      } else {
        this.loadPage(page);
      }
    }
    this.activateLoader = true;
  }

  private loadPage(page: PageModel) : void {
    if (page === PageModel.PAGE_RESEARCH) {
      this.loadOpeningPageService.loadResearchPageDataAndNavigate();
    } else if (page === PageModel.PAGE_MOVIE) {
      this.loadOpeningPageService.loadMoviePageDataAndNavigate();
    } else if (page === PageModel.PAGE_SERIES) {
      this.loadOpeningPageService.loadSeriesPageDataAndNavigate();
    } else if (page === PageModel.PAGE_CATALOG) {
      this.loadOpeningPageService.loadCatalogPageDataAndNavigate();
    } else if (page === PageModel.PAGE_MYLIST) {
      this.loadOpeningPageService.loadMyListPageDataAndNavigate();
    } else if (page === PageModel.PAGE_EDITION) {
      this.loadOpeningPageService.loadEditionPageDataAndNavigate();
    } else if (page === PageModel.PAGE_USER) {
      this.loadOpeningPageService.loadUserPageDataAndNavigate();
    } else if (page === PageModel.PAGE_LICENSE) {
      this.loadOpeningPageService.loadLicensePageDataAndNavigate();
    } else {
      this.loadOpeningPageService.loadHomePageDataAndNavigate();
    }
  }

  async onLogout(): Promise<void> {
    this.authService.logout();
    await this.electronService.deleteCacheAndCookies();
    this.electronService.reloadWindow();
  }

  srcDefaultPp: string = 'pp/pp.jpg';
  errorPpUser(): void {
    this.srcPP = this.srcDefaultPp;
  }

}
