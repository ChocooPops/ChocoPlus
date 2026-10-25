import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EntityKind } from '../../models/game-entity.interface';
import { ENTITY_CONFIGS } from '../../models/entity-config';

// Which sprites may appear in a game, chosen by the player and saved between games
@Injectable({
  providedIn: 'root'
})
export class SpriteSelectionService {

  private readonly enabledSpritesKey: string = 'GAME_ENABLED_SPRITES';

  // only sprites spawned on their own: bombs, explosions and bullets follow the sprite that creates them
  private readonly selectableKinds: EntityKind[] = (Object.keys(ENTITY_CONFIGS) as EntityKind[])
    .filter((kind: EntityKind) => ENTITY_CONFIGS[kind].autoSpawn !== false);

  private disabledSubject: BehaviorSubject<Set<EntityKind>> = new BehaviorSubject<Set<EntityKind>>(this.readDisabled());
  private disabled$: Observable<Set<EntityKind>> = this.disabledSubject.asObservable();

  public getSelectableKinds(): EntityKind[] {
    return this.selectableKinds;
  }

  public getDisabled(): Observable<Set<EntityKind>> {
    return this.disabled$;
  }

  public isEnabled(kind: EntityKind): boolean {
    return !this.disabledSubject.value.has(kind);
  }

  public toggle(kind: EntityKind): void {
    const disabled: Set<EntityKind> = new Set(this.disabledSubject.value);
    if (disabled.has(kind)) {
      disabled.delete(kind);
    } else {
      disabled.add(kind);
    }
    this.save(disabled);
  }

  public setAll(enabled: boolean): void {
    this.save(new Set(enabled ? [] : this.selectableKinds));
  }

  private save(disabled: Set<EntityKind>): void {
    this.disabledSubject.next(disabled);
    localStorage.setItem(this.enabledSpritesKey, JSON.stringify([...disabled]));
  }

  // stores the disabled sprites, so a sprite added later to the game is enabled by default
  private readDisabled(): Set<EntityKind> {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(this.enabledSpritesKey) ?? '[]');
      return new Set(Array.isArray(value)
        ? value.filter((kind: unknown): kind is EntityKind => this.selectableKinds.includes(kind as EntityKind))
        : []);
    } catch {
      return new Set();
    }
  }

}
