import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// Shown at the end of an episode: the next one, played when the countdown ends (or right away)
@Component({
  selector: 'app-next-episode-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './next-episode-card.component.html',
  styleUrl: './next-episode-card.component.css'
})
export class NextEpisodeCardComponent {

  @Input() label: string = '';
  @Input() name: string = '';
  @Input() poster: string | undefined;
  // Seconds before the next episode starts, null while the current one is still playing
  @Input() countdown: number | null = null;
  @Output() play = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  posterFailed: boolean = false;

  onPlay(event: MouseEvent): void {
    event.stopPropagation();
    this.play.emit();
  }

  onCancel(event: MouseEvent): void {
    event.stopPropagation();
    this.cancel.emit();
  }
}
