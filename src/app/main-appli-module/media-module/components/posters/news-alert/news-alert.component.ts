import { Component, Input } from '@angular/core';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-news-alert',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './news-alert.component.html',
  styleUrl: './news-alert.component.css'
})
export class NewsAlertComponent {

  @Input() isRecent: boolean = false;
  @Input() mediaType!: MediaTypeModel;
  @Input() visibility!: boolean;

  MediaType = MediaTypeModel;

}
