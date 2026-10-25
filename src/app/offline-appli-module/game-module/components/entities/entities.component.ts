import { Component, Input } from '@angular/core';
import { EntityService } from '../../services/entity/entity.service';
import { GameEntity } from '../../models/game-entity.interface';
import { ENTITY_CONFIGS } from '../../models/entity-config';

@Component({
  selector: 'app-entities',
  standalone: true,
  imports: [],
  templateUrl: './entities.component.html',
  styleUrl: './entities.component.css'
})
export class EntitiesComponent {

  // 'world' = entities drawn behind the character, 'effects' = pickup effects drawn in front of it,
  // 'foreground' = entities configured to be drawn in front of the platform
  @Input() layer: 'world' | 'effects' | 'foreground' = 'world';

  // array mutated in place by the game loop: no subscription needed
  public readonly entities: GameEntity[];

  constructor(entityService: EntityService) {
    this.entities = entityService.getEntities();
  }

  public isInLayer(entity: GameEntity): boolean {
    if (entity.state === 'collected') {
      return this.layer === 'effects';
    }
    return ENTITY_CONFIGS[entity.kind].foreground === true ? this.layer === 'foreground' : this.layer === 'world';
  }

  public getTransform(entity: GameEntity): string {
    return `translate3d(${entity.x}px, ${entity.y}px, 0)`;
  }

  public isGlitched(entity: GameEntity): boolean {
    return ENTITY_CONFIGS[entity.kind].glitch === true;
  }

  public isAboutToTeleport(entity: GameEntity): boolean {
    const teleport = ENTITY_CONFIGS[entity.kind].teleport;
    return !!teleport && entity.teleportsLeft > 0 && !entity.falling && entity.teleportTimer < teleport.warning;
  }

  public isSwinging(entity: GameEntity): boolean {
    return ENTITY_CONFIGS[entity.kind].swingWhileFalling === true && entity.falling;
  }

  // Enemy still off-screen on the left, coming from behind
  public isIncomingFromBehind(entity: GameEntity): boolean {
    return entity.state === 'active' && entity.vx > 0 && entity.x + entity.width < 0;
  }

}
