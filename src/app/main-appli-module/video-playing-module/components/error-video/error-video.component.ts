import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PlayerSessionService } from '../../services/player-session/player-session.service';
import { PlayerError, PlayerErrorKind, toPlayerError } from './player-error';

@Component({
  selector: 'app-error-video',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './error-video.component.html',
  styleUrl: './error-video.component.css'
})
export class ErrorVideoComponent implements OnChanges {

  @Input() error: unknown;
  @Output() retry = new EventEmitter<void>();

  readonly srcWarning: string = 'icon/warning.svg';
  playerError: PlayerError = { kind: 'unknown', detail: '' };
  displayDetails: boolean = false;

  private readonly keys: Record<PlayerErrorKind, string> = {
    'server': 'SERVER',
    'ffmpeg-missing': 'FFMPEG_MISSING',
    'unauthorized': 'UNAUTHORIZED',
    'network': 'NETWORK',
    'not-available': 'NOT_AVAILABLE',
    'unsupported': 'UNSUPPORTED',
    'unknown': 'UNKNOWN'
  };

  constructor(private readonly playerSessionService: PlayerSessionService) { }

  ngOnChanges(): void {
    this.playerError = toPlayerError(this.error);
    this.displayDetails = false;
  }

  get titleKey(): string {
    return `PLAYER.ERROR.${this.keys[this.playerError.kind]}_TITLE`;
  }

  get messageKey(): string {
    return `PLAYER.ERROR.${this.keys[this.playerError.kind]}_MESSAGE`;
  }

  onClickCard(event: Event): void {
    event.stopPropagation();
  }

  toggleDetails(): void {
    this.displayDetails = !this.displayDetails;
  }

  onRetry(): void {
    this.retry.emit();
  }

  onClose(): void {
    this.playerSessionService.close();
  }

}
