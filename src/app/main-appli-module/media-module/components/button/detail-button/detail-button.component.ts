import { Component, Input } from '@angular/core';
import { MediaModel } from '../../../models/media.interface';
import { MediaSelectedService } from '../../../services/media-selected/media-selected.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-detail-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './detail-button.component.html',
  styleUrls: ['./detail-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class DetailButtonComponent {

  @Input() media!: MediaModel | undefined;
  srcDetail: string = 'icon/detail.svg';

  constructor(private readonly mediaSelectedService: MediaSelectedService) { }

  onClick(): void {
    if (this.media) this.mediaSelectedService.selectMedia(this.media);
  }

}
