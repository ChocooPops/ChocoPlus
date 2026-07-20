import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cutoff-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './cutoff-button.component.html',
  styleUrl: '../../../../common-module/styles/movie-button.css'
})
export class CutoffButtonComponent {

  @Output() cutoffMedia = new EventEmitter<void>;
  srcCutoff: string = 'icon/cutoff.svg';

  onClick(): void {
    this.cutoffMedia.emit();
  }

}
