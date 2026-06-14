import { Component } from '@angular/core';
import { UserModel } from '../../../user-module/dto/user.model';
import { UserService } from '../../../user-module/service/user/user.service';
import { firstValueFrom, Subscription, take } from 'rxjs';
import { RoleModel } from '../../../../common-module/models/role.enum';
import { NgClass } from '@angular/common';
//import { Router } from '@angular/router';
import { ElectronService } from '../../../../common-module/services/electron/electron.service';
import { UserParametersService } from '../../../user-module/service/user-parameters/user-parameters.service';
import { MenuTabModel } from '../../model/menu-tab.interface';
import { AuthService } from '../../../../launch-module/services/auth/auth.service';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { StreamService } from '../../../video-playing-module/services/stream/stream.service';
import { ChocoPlayerModel } from '../../../video-playing-module/models/choco-player.interface';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationLanguageService } from '../../../../common-module/services/translation-language/translation-language.service';
import { ProcessStatus } from '../../../video-playing-module/models/process-status.enum';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-user-tab',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './user-tab.component.html',
  styleUrl: './user-tab.component.css'
})
export class UserTabComponent {

  subscription: Subscription = new Subscription();
  srcReset: string = 'icon/modify.svg';
  srcRandom: string = 'icon/random.svg';

  user!: UserModel;
  Role = RoleModel;
  class: string = 'not-visible-under-menu';
  classArrow: string = 'arrow-not-clicked';

  userMenu: MenuTabModel[] = [];
  disableParamAdmin: boolean = true;

  isShowingKeys: boolean = false;

  srcTraductionFill: string = 'icon/traduction-fill.svg';
  srcTraductionNotFill: string = 'icon/traduction-not-fill.svg';

  csharpProcessStatus!: ProcessStatus;
  ProcessStatus = ProcessStatus;

  constructor(private readonly userService: UserService,
    private readonly movieService: MovieService,
    //private router: Router,
    private readonly electronService: ElectronService,
    private readonly userParametersService: UserParametersService,
    private readonly authService: AuthService,
    private readonly seriesService: SeriesService,
    private readonly streamService: StreamService,
    private readonly translationLanguageService: TranslationLanguageService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.userMenu = this.userParametersService.getAllUserTabMenu();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getCurrentUser().subscribe((user: UserModel | undefined) => {
        if (user) {
          this.user = user;
          if (this.user.role != RoleModel.ADMIN && this.disableParamAdmin) {
            this.userMenu = this.userMenu.slice(0, this.userMenu.length - 1);
            this.disableParamAdmin = false;
          }
        }
      })
    );
    this.subscription.add(
      this.translationLanguageService.getIsShowingKeys().subscribe((value) => {
        this.isShowingKeys = value;
      })
    );
    this.subscription.add(
      this.streamService.getCsharpProcessStatus().subscribe((data: ProcessStatus) => {
        this.csharpProcessStatus = data;
        this.cdr.detectChanges();
      })
    );
  }

  onMouseEnter(): void {
    this.class = 'visible-under-menu';
    this.classArrow = 'arrow-clicked';
  }

  onMouseLeave(): void {
    this.class = 'not-visible-under-menu';
    this.classArrow = 'arrow-not-clicked';
  }

  async onClickRandomMovie(): Promise<void> {
    const movie = await firstValueFrom(
      this.movieService.fetchRandomMovie().pipe(take(1))
    );

    if (!movie) return;

    const chocoPlayer: ChocoPlayerModel = {
      MediaId: movie.id,
      Title: movie.title,
      Url: this.streamService.getUrlStreamMovie(movie.id),
      Height: window.innerHeight,
      Width: window.innerWidth,
      EpisodeId: -1,
      SeasonIndex: -1,
      WatchProgress: 0,
      SeasonMenu: []
    };

    await this.streamService.launchJavaAppToMovie(chocoPlayer);
    //this.router.navigate(['/main-app/read-video', movie.mediaType, movie.id]);
  }

  async onClickRandomSeries(): Promise<void> {
    const series: SeriesModel | undefined = await firstValueFrom(
      this.seriesService.fetchRandomSeries().pipe(take(1))
    );

    if (!series) return;

    const episode: EpisodeModel = await firstValueFrom(
      this.seriesService.fetchFirstEpisode(series.id).pipe(take(1))
    )

    const chocoPlayer: ChocoPlayerModel = {
      MediaId: series.id,
      Title: `${series.title} - ${episode.name}`,
      Url: this.streamService.getUrlStreamEpisode(series.id, episode.id),
      Height: window.innerHeight,
      Width: window.innerWidth,
      EpisodeId: episode.id,
      SeasonIndex: 0,
      WatchProgress: 0,
      SeasonMenu: series.seasons
        ? series.seasons.map(season => ({
            Id: season.id,
            SeriesId: season.seriesId,
            Name: season.name,
            SeasonNumber: season.seasonNumber
          }))
        : []
    };

    await this.streamService.launchJavaAppToMovie(chocoPlayer);
    //this.router.navigate(['/main-app/read-video', series.mediaType, series.id, -1, -1]);
  }

  async onClickReset(): Promise<void> {
    await this.electronService.deleteCacheAndCookies();
    this.electronService.reloadWindow();
  }

  async onClickDeconnexion(): Promise<void> {
    this.authService.logout();
    await this.electronService.deleteCacheAndCookies();
    this.electronService.reloadWindow();
  }

  onNavigateToUserPage(): void {
    this.userParametersService.navigateOnUserPage();
  }

  onNavigateToUserTab(id: number): void {
    this.userParametersService.navigateByUserTabId(id);
  }

  srcDefaultPp: string = 'pp/pp.jpg';
  errorPpUser(): void {
    this.user.profilPhoto = this.srcDefaultPp;
  }

  onToggleTranslationKeys(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isShowingKeys) {
      this.translationLanguageService.revertToPreviousLang();
    } else {
      this.translationLanguageService.showTranslationKeys();
    }
  }

}
