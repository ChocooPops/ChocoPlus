import { Component, HostListener } from '@angular/core';
import { StarsComponent } from './components/stars/stars.component';
import { PlateformComponent } from './components/plateform/plateform.component';
import { SkyComponent } from './components/sky/sky.component';
import { CloudComponent } from './components/cloud/cloud.component';
import { CharacterComponent } from './components/character/character.component';
import { TreeComponent } from './components/tree/tree.component';
import { GoldComponent } from './components/gold/gold.component';
import { PlateformService } from './services/plateform/plateform.service';
import { GoldService } from './services/gold/gold.service';
import { CharacterService } from './services/character/character.service';
import { ScoreComponent } from './components/score/score.component';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [StarsComponent, ScoreComponent, TreeComponent, GoldComponent, PlateformComponent, SkyComponent, CloudComponent, CharacterComponent],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css'
})
export class GamePageComponent {

  constructor(private plateformService: PlateformService,
    private goldService: GoldService,
    private characterService: CharacterService,
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    const width = target.innerWidth;
    this.plateformService.getPlateform().setClientRectCharacter();
    this.goldService.setMinWidthToAppear(width);
    this.characterService.getCharacter().setWidthWindows(width);
  }

}
