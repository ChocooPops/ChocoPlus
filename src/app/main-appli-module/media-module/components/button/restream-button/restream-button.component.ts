import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-restream-button',
  standalone: true,
  imports: [],
  templateUrl: './restream-button.component.html',
  styleUrls: ['./restream-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class RestreamButtonComponent {

  @Input()
  idMovie!: number;

  @Input()
  activateRetream !: boolean;

  @Output()
  emitNewStream = new EventEmitter<any>();

  srcReset: string = 'icon/restream.svg';

  onClick(): void {
    if (this.activateRetream) {
      this.emitNewStream.emit();
    }
  }

}
