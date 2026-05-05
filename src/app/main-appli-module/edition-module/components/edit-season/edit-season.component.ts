import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { EditSeasonModel } from '../../models/series/edit-season.interface';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-season',
  standalone: true,
  imports: [TranslatePipe, InputImageEditionComponent, InputTextEditionComponent],
  templateUrl: './edit-season.component.html',
  styleUrls: ['./edit-season.component.css', '../../styles/edition.css']
})
export class EditSeasonComponent {

  @Input() season !: EditSeasonModel;

  @Output() fillPosterSeason = new EventEmitter<string | ArrayBuffer | undefined | null>();
  @Output() changeTitleSeason = new EventEmitter<string>();
  @Output() changeJellyfinIdSeason = new EventEmitter<string>();

  placeHolderSeason = "EDITION.SERIES.PLACEHOLDER_SEASON"
  placeHolderSeasonPoster = "EDITION.SERIES.PLACEHOLDER_SEASON_POSTER"

  onFillPoster(poster: string | ArrayBuffer | undefined | null): void {
    this.fillPosterSeason.emit(poster)
  }

  onChangeTitle(title: string): void {
    this.changeTitleSeason.emit(title);
  }

  onChangeJellyFinId(id: string): void {
    this.changeJellyfinIdSeason.emit(id);
  }

}
