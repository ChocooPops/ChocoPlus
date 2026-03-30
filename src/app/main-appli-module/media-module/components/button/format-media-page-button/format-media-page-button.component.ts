import { Component } from '@angular/core';
import { FormatMediaPageButtonService } from '../../../services/format-media-page/format-media-page-button.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { FormatMediaPageModel } from '../../../models/format-media-page-enum';

@Component({
  selector: 'app-format-media-page-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './format-media-page-button.component.html',
  styleUrls: ['../../../../common-module/styles/movie-button.css', './format-media-page-button.component.css']
})
export class FormatMediaPageButtonComponent {

  isHovering: boolean = false;
  srcButton = 'icon/format-media-page.svg';
  srcButtonPressed = 'icon/format-media-page-pressed.svg';
  subscription !: Subscription;

  currentClass: string = '';
  verticalClass: string = 'vertical';
  horizontalClass: string = 'horizontal';

  constructor(private readonly formatMediaPageButtonService: FormatMediaPageButtonService) { }

  ngOnInit(): void {
    this.subscription = this.formatMediaPageButtonService.getCurrentFormatMediaPage().subscribe((value: FormatMediaPageModel) => {
      if (value === FormatMediaPageModel.HORIZONTAL) {
        this.currentClass = this.verticalClass;
      } else {
        this.currentClass = this.horizontalClass;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onMouseEnter(): void {
    this.isHovering = true;
  }

  onMouseLeave(): void {
    this.isHovering = false;
  }

  onClick(): void {
    this.formatMediaPageButtonService.toggleFormatMediaPage();
  }

}
