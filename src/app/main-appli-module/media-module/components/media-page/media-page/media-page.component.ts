import { Component } from '@angular/core';
import { FormatMediaPageModel } from '../../../models/format-media-page-enum';
import { Subscription } from 'rxjs';
import { FormatMediaPageButtonService } from '../../../services/format-media-page/format-media-page-button.service';
import { MediaVerticalPageComponent } from '../media-page-vertical/media-vertical-page/media-page.component';
import { MediaHorizontalPageComponent } from '../media-page-horizontal/media-horizontal-page/media-horizontal-page.component';

@Component({
  selector: 'app-media-page',
  standalone: true,
  imports: [MediaVerticalPageComponent, MediaHorizontalPageComponent],
  templateUrl: './media-page.component.html',
  styleUrl: './media-page.component.css'
})
export class MediaPageComponent {

  currentMediaPage!: FormatMediaPageModel;
  FormatMediaPage = FormatMediaPageModel;
  subscription !: Subscription;

  constructor(private readonly formatMediaPageButtonService: FormatMediaPageButtonService) { }
  
  ngOnInit(): void {
    this.subscription = this.formatMediaPageButtonService.getCurrentFormatMediaPage().subscribe((value: FormatMediaPageModel) => {
      this.currentMediaPage = value;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
