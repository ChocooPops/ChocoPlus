import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CharacterService } from '../../../game-module/services/character/character.service';
import { CloudService } from '../../../game-module/services/cloud/cloud.service';
import { GoldService } from '../../../game-module/services/gold/gold.service';
import { PlateformService } from '../../../game-module/services/plateform/plateform.service';
import { SkyService } from '../../../game-module/services/sky/sky.service';
import { TreeService } from '../../../game-module/services/tree/tree.service';
import { ButtonFormComponent } from '../button-form/button-form.component';
import { TypeButtonModel } from '../../models/type-button.model';

@Component({
  selector: 'app-preload-offline-app',
  standalone: true,
  imports: [ButtonFormComponent],
  templateUrl: './preload-offline-app.component.html',
  styleUrl: './preload-offline-app.component.css'
})
export class PreloadOfflineAppComponent {

  messageOffline: string = 'Mode hors ligne';
  messageLoading: string = 'Chargement des sprites ...';
  message: string = this.messageOffline;
  srcLoading: string = 'game/cat_loading.gif';
  srcFix: string = 'game/cat_fix.png';
  srcCat: string = this.srcFix;
  transitionLoad: boolean = false;
  transitionActivating: boolean = false;
  TypeButton = TypeButtonModel;
  nameButtonLogin: string = "S'identifier";
  nameButtonRegister: string = "Créer un compte";

  constructor(private router: Router,
    private characterService: CharacterService,
    private cloudService: CloudService,
    private goldService: GoldService,
    private plateformService: PlateformService,
    private skyService: SkyService,
    private treeService: TreeService
  ) { }

  onClick(): void {
    this.transitionLoad = !this.transitionLoad;
    if (!this.transitionActivating) {
      this.srcCat = this.srcLoading;
      this.message = this.messageLoading;
      this.transitionActivating = true;
    }
    this.loadGame();
  }

  loadGame(): void {
    combineLatest([
      this.characterService.getCharacter().getSpriteIsLoad(),    // 0
      this.characterService.getRainbow().getSpriteIsLoad(),      // 1
      this.characterService.getSparks().getSpriteIsLoad(),       // 2
      this.cloudService.getCloudByIndice(0).getSpriteIsLoad(),   // 3
      this.cloudService.getCloudByIndice(1).getSpriteIsLoad(),   // 4
      this.cloudService.getCloudByIndice(2).getSpriteIsLoad(),   // 5
      this.cloudService.getCloudByIndice(3).getSpriteIsLoad(),   // 6
      this.cloudService.getCloudByIndice(4).getSpriteIsLoad(),   // 7
      this.goldService.getGold().getSpriteIsLoad(),              // 8
      this.plateformService.getPlateform().getSpriteIsLoad(),    // 9
      this.skyService.getSky().getSpriteIsLoad(),                // 10
      this.treeService.getYellowTreeSprite().getSpriteIsLoad(),  // 11
      this.treeService.getBlueTreeSprite().getSpriteIsLoad()     // 12
    ]).subscribe((
      [
        isCharacterLoaded,
        isRainbowLoaded,
        isSparksLoaded,
        isCloud0Loaded,
        isCloud1Loaded,
        isCloud2Loaded,
        isCloud3Loaded,
        isCloud4Loaded,
        isGoldLoaded,
        isPlatformLoaded,
        isSkyLoaded,
        isYellowTreeLoaded,
        isBlueTreeLoaded
      ]
    ) => {
      const allLoaded =
        isCharacterLoaded &&
        isRainbowLoaded &&
        isSparksLoaded &&
        isCloud0Loaded &&
        isCloud1Loaded &&
        isCloud2Loaded &&
        isCloud3Loaded &&
        isCloud4Loaded &&
        isGoldLoaded &&
        isPlatformLoaded &&
        isSkyLoaded &&
        isYellowTreeLoaded &&
        isBlueTreeLoaded;

      if (allLoaded) {
        setTimeout(() => {
          this.router.navigateByUrl('offline-app');
        }, 1000);
      }
    });
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

}
