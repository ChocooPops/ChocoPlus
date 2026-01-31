import { Component } from '@angular/core';
import { UserModel } from '../../../user-module/dto/user.model';
import { UserService } from '../../../user-module/service/user/user.service';
import { Subscription, take } from 'rxjs';
import { RoleModel } from '../../../../common-module/models/role.enum';
import { NgClass } from '@angular/common';
import { MediaModel } from '../../../media-module/models/media.interface';
import { Router } from '@angular/router';
import { ElectronService } from '../../../../common-module/services/electron/electron.service';
import { UserParametersService } from '../../../user-module/service/user-parameters/user-parameters.service';
import { MenuTabModel } from '../../model/menu-tab.interface';
import { AuthService } from '../../../../launch-module/services/auth/auth.service';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { SeriesModel } from '../../../media-module/models/series/series.interface';

@Component({
  selector: 'app-user-tab',
  standalone: true,
  imports: [NgClass],
  templateUrl: './user-tab.component.html',
  styleUrl: './user-tab.component.css'
})
export class UserTabComponent {

  subscription!: Subscription;
  srcReset: string = 'icon/modify.svg';
  srcRandom: string = 'icon/random.svg';

  user!: UserModel;
  role = RoleModel;
  class: string = 'not-visible-under-menu';
  classArrow: string = 'arrow-not-clicked';

  userMenu: MenuTabModel[] = [];
  disableParamAdmin: boolean = true;

  constructor(private userService: UserService,
    private movieService: MovieService,
    private router: Router,
    private electronService: ElectronService,
    private userParametersService: UserParametersService,
    private authService: AuthService,
    private seriesService: SeriesService
  ) {
    this.userMenu = this.userParametersService.getAllUserTabMenu();
  }

  ngOnInit(): void {
    this.subscription = this.userService.getCurrentUser().subscribe((user: UserModel | undefined) => {
      if (user) {
        this.user = user;
        if (this.user.role != RoleModel.ADMIN && this.disableParamAdmin) {
          this.userMenu = this.userMenu.slice(0, this.userMenu.length - 1);
          this.disableParamAdmin = false;
        }
      }
    });
  }

  onMouseEnter(): void {
    this.class = 'visible-under-menu';
    this.classArrow = 'arrow-clicked';
  }

  onMouseLeave(): void {
    this.class = 'not-visible-under-menu';
    this.classArrow = 'arrow-not-clicked';
  }

  onClickRandomMovie(): void {
    this.movieService.fetchRandomMovie().pipe(take(1)).subscribe((movie: MediaModel | undefined) => {
      if (movie) {
        this.router.navigate(['/main-app/read-video', movie.mediaType, movie.id]);
      }
    })
  }

  onClickRandomSeries(): void {
    this.seriesService.fetchRandomSeries().pipe(take(1)).subscribe((series: SeriesModel | undefined) => {
      if (series) {
        this.router.navigate(['/main-app/read-video', series.mediaType, series.id, -1, -1]);
      }
    })
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

}
