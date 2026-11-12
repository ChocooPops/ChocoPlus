import { Directive, EventEmitter, Injectable, OnDestroy, Output, inject } from '@angular/core';

// Only one panel of the player's controls is open at a time
@Injectable({
  providedIn: 'root'
})
export class PlayerPanelService {

  private openPanel: PlayerPanel | null = null;

  public get hasOpenPanel(): boolean {
    return this.openPanel !== null;
  }

  // The panel open until now closes first: its controls flag is released before the new one sets it
  public opening(panel: PlayerPanel): void {
    const previous = this.openPanel;
    this.openPanel = panel;
    if (previous && previous !== panel) previous.close();
  }

  public closed(panel: PlayerPanel): void {
    if (this.openPanel === panel) this.openPanel = null;
  }

}

// Hover behaviour of the panels opening above the player's buttons (episodes, audio / subtitles):
// - opens after a short hover, so passing over the button on the way to another one doesn't open it;
//   at once on click, or when another panel is already open (going from one button to the next);
// - closes a moment after the mouse left the button and the panel: a short way out (overshoot,
//   diagonal move) doesn't close it, coming back cancels the closing;
// - one panel at a time. A closed panel doesn't catch the mouse (pointer-events in player-panel.css).
@Directive()
export abstract class PlayerPanel implements OnDestroy {

  // Keeps the player's controls displayed while the panel is open
  @Output() setDisplayControls = new EventEmitter<boolean>();

  isOpen: boolean = false;

  private readonly panels = inject(PlayerPanelService);
  private readonly openDelay: number = 150;
  private readonly closeDelay: number = 350;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  // Mouse over the button or the open panel
  onPointerEnter(): void {
    this.clearCloseTimer();
    if (this.isOpen || this.openTimer) return;
    if (this.panels.hasOpenPanel) {
      this.open();
      return;
    }
    this.openTimer = setTimeout(() => {
      this.openTimer = null;
      this.open();
    }, this.openDelay);
  }

  onPointerLeave(): void {
    this.clearOpenTimer();
    if (!this.isOpen || this.closeTimer) return;
    this.closeTimer = setTimeout(() => {
      this.closeTimer = null;
      this.close();
    }, this.closeDelay);
  }

  open(): void {
    this.clearTimers();
    if (this.isOpen) return;
    this.panels.opening(this);
    this.isOpen = true;
    this.setDisplayControls.emit(true);
  }

  close(): void {
    this.clearTimers();
    if (!this.isOpen) return;
    this.isOpen = false;
    this.panels.closed(this);
    this.onClose();
    this.setDisplayControls.emit(false);
  }

  // Panel-specific state to reset when it closes
  protected onClose(): void { }

  ngOnDestroy(): void {
    this.clearTimers();
    this.panels.closed(this);
  }

  private clearTimers(): void {
    this.clearOpenTimer();
    this.clearCloseTimer();
  }

  private clearOpenTimer(): void {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

}
