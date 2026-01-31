import { Component } from '@angular/core';
import { SavePathService } from '../../../common-module/services/save-path/save-path.service';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';

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

  constructor(private savePathService: SavePathService) { }

  onClickBack() {
    this.savePathService.navigateToOldPath();
  }

}
