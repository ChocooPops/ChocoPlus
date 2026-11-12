import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { PlayerSessionService } from '../../services/player-session/player-session.service';

@Component({
  selector: 'app-error-video',
  standalone: true,
  imports: [NgClass],
  templateUrl: './error-video.component.html',
  styleUrl: './error-video.component.css'
})
export class ErrorVideoComponent {

  srcWarning: string = "icon/warning.svg"
  displayError: boolean = true;

  constructor(private playerSessionService: PlayerSessionService) { }

  onClickCancel(): void {
    this.displayError = false;
  }

  // The player is shown over the page it was launched from: closing it is going back
  onClickBack(): void {
    this.playerSessionService.close();
  }

}
