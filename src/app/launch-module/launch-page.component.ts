import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../main-appli-module/user-module/service/user/user.service';
import { ImagePreloaderService } from '../common-module/services/image-preloader/image-preloader.service';
import { UserModel } from '../main-appli-module/user-module/dto/user.model';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-launch-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './launch-page.component.html',
  styleUrls: ['./launch-page.component.css', '../../app/common-module/styles/loader.css']
})
export class LaunchPageComponent {

  srcLogo: string = 'icon/choco.svg';
  isLoading: boolean = true;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private imagePreloaderService: ImagePreloaderService,
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.authService.initFromSecureStore();
    this.userService.fetchCurrentUser().pipe(take(1)).subscribe({
      next: (user: UserModel) => {
        this.imagePreloaderService.preloadImages([user.profilPhoto]).finally(() => {
          this.router.navigateByUrl('preload-stream-app');
          this.isLoading = false;
        });
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.router.navigate(['preload-offline-app'], { relativeTo: this.route });
        } else {
          this.router.navigate(['login'], { relativeTo: this.route });
        }
        this.isLoading = false;
      }
    })
  }

}
