import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, combineLatest, delay, filter, map, Observable, of, Subscription, switchMap, take, timeout } from 'rxjs';
import { CharacterService } from '../../../offline-appli-module/game-module/services/character/character.service';
import { CloudService } from '../../../offline-appli-module/game-module/services/cloud/cloud.service';
import { GoldService } from '../../../offline-appli-module/game-module/services/gold/gold.service';
import { PlateformService } from '../../../offline-appli-module/game-module/services/plateform/plateform.service';
import { SkyService } from '../../../offline-appli-module/game-module/services/sky/sky.service';
import { TreeService } from '../../../offline-appli-module/game-module/services/tree/tree.service';
import { DownloadService } from '../../../main-appli-module/media-module/services/download/download.service';
import { ButtonFormComponent } from '../button-form/button-form.component';
import { TypeButtonModel } from '../../models/type-button.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-preload-offline-app',
  standalone: true,
  imports: [ButtonFormComponent, TranslatePipe],
  templateUrl: './preload-offline-app.component.html',
  styleUrl: './preload-offline-app.component.css'
})
export class PreloadOfflineAppComponent {

  readonly nameButtonLogin = 'LAUNCH.LOGIN';
  readonly nameButtonRegister = 'LAUNCH.CREATE_ACCOUNT';
  readonly TypeButton = TypeButtonModel;
  private readonly messageOffline = 'LAUNCH.OFFLINE_MODE';
  private readonly messageLoading = 'LAUNCH.MESSAGE.LOADING_SPRITES';
  private readonly srcLoading: string = 'game/cat_loading.gif';
  private readonly srcFix: string = 'game/cat_fix.png';
  private readonly spritesTimeoutMs: number = 15000;

  message: string = this.messageOffline;
  srcCat: string = this.srcFix;
  transitionLoad: boolean = false;
  transitionActivating: boolean = false;

  private readonly subscription: Subscription = new Subscription();

  constructor(private readonly router: Router,
    private readonly characterService: CharacterService,
    private readonly cloudService: CloudService,
    private readonly goldService: GoldService,
    private readonly plateformService: PlateformService,
    private readonly skyService: SkyService,
    private readonly treeService: TreeService,
    private readonly downloadService: DownloadService
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onClick(): void {
    this.transitionLoad = !this.transitionLoad;
    if (this.transitionActivating) return;
    this.transitionActivating = true;
    this.srcCat = this.srcLoading;
    this.message = this.messageLoading;

    this.subscription.add(
      this.downloadService.mediaDownloadedIsEmpty().pipe(
        take(1),
        catchError(() => of(true)),
        map((isEmpty: boolean) => isEmpty ? 'offline-app/game' : 'offline-app/downloads'),
        switchMap((route: string) => this.waitForAllSprites().pipe(map(() => route))),
        delay(1000)
      ).subscribe((route: string) => this.router.navigateByUrl(route))
    );
  }

  onNavigateToLoginPage(): void {
    if (!this.transitionActivating) {
      this.router.navigateByUrl('login');
    }
  }

  onNavigateToRegisterPage(): void {
    if (!this.transitionActivating) {
      this.router.navigateByUrl('register');
    }
  }

  private waitForAllSprites(): Observable<void> {
    return combineLatest([
      this.characterService.getCharacter().getSpriteIsLoad(),
      this.characterService.getRainbow().getSpriteIsLoad(),
      this.characterService.getSparks().getSpriteIsLoad(),
      this.cloudService.getCloudByIndice(0).getSpriteIsLoad(),
      this.cloudService.getCloudByIndice(1).getSpriteIsLoad(),
      this.cloudService.getCloudByIndice(2).getSpriteIsLoad(),
      this.cloudService.getCloudByIndice(3).getSpriteIsLoad(),
      this.cloudService.getCloudByIndice(4).getSpriteIsLoad(),
      this.goldService.getGold().getSpriteIsLoad(),
      this.plateformService.getPlateform().getSpriteIsLoad(),
      this.skyService.getSky().getSpriteIsLoad(),
      this.treeService.getYellowTreeSprite().getSpriteIsLoad(),
      this.treeService.getBlueTreeSprite().getSpriteIsLoad()
    ]).pipe(
      filter((states: boolean[]) => states.every(Boolean)),
      take(1),
      timeout(this.spritesTimeoutMs),
      catchError(() => of(null)),
      map(() => undefined)
    );
  }

}
