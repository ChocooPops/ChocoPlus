import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { SavePathService } from '../../../common-module/services/save-path/save-path.service';

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

  constructor(private savePathService: SavePathService) { }

  onClickCancel(): void {
    this.displayError = false;
  }

  onClickBack(): void {
    this.savePathService.navigateToOldPath();
  }

}
