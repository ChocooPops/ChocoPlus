import { Component } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { ProfilPictureService } from '../../service/profil-picture/profil-picture.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { ProfilPictureModel } from '../../dto/profil-picture.interface';
import { UserService } from '../../service/user/user.service';

@Component({
  selector: 'app-edit-profil-picture',
  standalone: true,
  imports: [],
  templateUrl: './edit-profil-picture.component.html',
  styleUrls: ['./edit-profil-picture.component.css', '../../../../common-module/styles/loader.css']
})
export class EditProfilPictureComponent {

  private abortController = new AbortController();
  subscription: Subscription = new Subscription();
  profilPictures: ProfilPictureModel[] | undefined = undefined;

  constructor(private profilPictureService: ProfilPictureService,
    private imagePreloaderService: ImagePreloaderService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.profilPictureService.getAllProfilPicture().pipe(take(1)).subscribe((data: ProfilPictureModel[]) => {
        const img: string[] = data.map((item: ProfilPictureModel) => item.name);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          this.profilPictures = data;
        })
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

  onClickProfilPicture(idPicture: number): void {
    this.userService.fetchChangeProfilPicture(idPicture).pipe(take(1)).subscribe(() => { });
  }

}
