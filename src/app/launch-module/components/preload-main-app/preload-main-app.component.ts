import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImagePreloaderService } from '../../../common-module/services/image-preloader/image-preloader.service';
import { UserService } from '../../../main-appli-module/user-module/service/user/user.service';
import { forkJoin, Subscription, take } from 'rxjs';
import { SelectionModel } from '../../../main-appli-module/media-module/models/selection.interface';
import { LicenseModel } from '../../../main-appli-module/license-module/model/license.interface';
import { UserModel } from '../../../main-appli-module/user-module/dto/user.model';
import { ButtonFormComponent } from '../button-form/button-form.component';
import { TypeButtonModel } from '../../models/type-button.model';
import { AuthService } from '../../services/auth/auth.service';
import { FormatPosterModel } from '../../../main-appli-module/common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../main-appli-module/common-module/services/format-poster/format-poster.service';
import { LicenseService } from '../../../main-appli-module/license-module/service/license/licence.service';
import { SelectionService } from '../../../main-appli-module/media-module/services/selection/selection.service';
import { NewsService } from '../../../main-appli-module/news-module/services/news/news.service';
import { NewsModel } from '../../../main-appli-module/news-module/models/news.interface';
import { ElectronService } from '../../../common-module/services/electron/electron.service';

@Component({
  selector: 'app-preload-main-appli',
  standalone: true,
  imports: [ButtonFormComponent],
  templateUrl: './preload-main-app.component.html',
  styleUrls: ['./preload-main-app.component.css', '../../../common-module/styles/loader.css']
})
export class PreloadMainAppComponent {

  srcPP !: string;
  messageWelcome !: string;
  subscription: Subscription = new Subscription();
  activateLoader: boolean = false;
  transitionPP: boolean = false;
  TypeButton = TypeButtonModel;
  nameButtonLogin = 'Se déconnecter';

  constructor(private router: Router,
    private imagePreloaderService: ImagePreloaderService,
    private userService: UserService,
    private selectionService: SelectionService,
    private licenseService: LicenseService,
    private authService: AuthService,
    private formatPosterService: FormatPosterService,
    private newsService: NewsService,
    private electronService: ElectronService
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().pipe(take(1)).subscribe((user: UserModel | undefined) => {
      if (user) {
        this.messageWelcome = 'Bienvenue ' + user.pseudo;
        this.srcPP = user.profilPhoto;
      }
    });
    this.userService.fetchMyMediaListByUserId().pipe(take(1)).subscribe(data => { });
  }

  onClickProfil(): void {
    this.transitionPP = !this.transitionPP;
    if (!this.activateLoader) {
      this.loadHomePage();
    }
    this.activateLoader = true;
  }

  private loadHomePage(): void {
    forkJoin({
      selections: this.selectionService.fetchSelectionOnHomePage(),
      news: this.newsService.fetchGetAllNews(),
      licensesHome: this.licenseService.fetchAllLicenseHome()
    }).pipe(take(1)).subscribe((result: { selections: SelectionModel[]; news: NewsModel[], licensesHome: LicenseModel[] }) => {
      const img: string[] = [];
      const format: FormatPosterModel = this.formatPosterService.getFormatPosterHomeValue();
      img.push(...this.imagePreloaderService.getAllIconsFromLicense(result.licensesHome));
      img.push(...this.imagePreloaderService.getImageFromNewsList(result.news));
      img.push(...this.imagePreloaderService.getPosterFromSelectionToLoad(result.selections, format));

      this.imagePreloaderService.preloadImages(img).finally(() => {
        this.router.navigateByUrl('main-app');
      })
    })
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
