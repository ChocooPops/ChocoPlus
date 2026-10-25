import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { EntityKind } from '../../models/game-entity.interface';
import { ENTITY_CONFIGS } from '../../models/entity-config';
import { SpriteSelectionService } from '../../services/sprite-selection/sprite-selection.service';

@Component({
  selector: 'app-sprite-selection',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './sprite-selection.component.html',
  styleUrl: './sprite-selection.component.css'
})
export class SpriteSelectionComponent implements OnInit, OnDestroy {

  @Output() closed: EventEmitter<void> = new EventEmitter<void>();

  public readonly kinds: EntityKind[];
  public disabled: Set<EntityKind> = new Set();

  private subscription: Subscription = new Subscription();

  constructor(private spriteSelectionService: SpriteSelectionService) {
    this.kinds = this.spriteSelectionService.getSelectableKinds();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.spriteSelectionService.getDisabled().subscribe((disabled: Set<EntityKind>) => {
        this.disabled = disabled;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getImage(kind: EntityKind): string {
    return ENTITY_CONFIGS[kind].previewSrc ?? ENTITY_CONFIGS[kind].src;
  }

  // file name without folder nor extension, e.g. 'game/devil.gif' -> 'devil'
  public getName(kind: EntityKind): string {
    return ENTITY_CONFIGS[kind].src.split('/').pop()?.split('.')[0] ?? kind;
  }

  // red card: hurts the player itself, or drops / fires something that does
  public isDangerous(kind: EntityKind): boolean {
    const config = ENTITY_CONFIGS[kind];
    const dropsDanger: boolean = !!config.drops && ENTITY_CONFIGS[config.drops.kind].isEnemy;
    return config.isEnemy || dropsDanger || !!config.shooter;
  }

  public onToggle(kind: EntityKind): void {
    this.spriteSelectionService.toggle(kind);
  }

  public onSetAll(enabled: boolean): void {
    this.spriteSelectionService.setAll(enabled);
  }

  public onClose(): void {
    this.closed.emit();
  }

}
