import { Component } from '@angular/core';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { PlayerSessionService } from '../../services/player-session/player-session.service';

@Component({
  selector: 'app-bt-back',
  standalone: true,
  imports: [BtClassicComponent],
  templateUrl: './bt-back.component.html',
  styleUrls: ['./bt-back.component.css']
})
export class BtBackComponent {

  folder: string = "icon/controls/";
  srcBackArrow: string = this.folder + "back-arrow.svg";

  constructor(private playerSessionService: PlayerSessionService) { }

  // The player is shown over the page it was launched from: closing it is going back
  onClickBack() {
    this.playerSessionService.close();
  }

}
