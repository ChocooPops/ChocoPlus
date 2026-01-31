import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputPosterModel } from '../../models/input-poster.interface';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { ButtonAddComponent } from '../button-add/button-add.component';

@Component({
  selector: 'app-input-poster-horizontal-edition',
  standalone: true,
  imports: [InputImageEditionComponent, ButtonAddComponent],
  templateUrl: './input-poster-horizontal-edition.component.html',
  styleUrl: './input-poster-horizontal-edition.component.css'
})
export class InputPosterHorizontalEditionComponent {

  @Input() posters: InputPosterModel[] = [];
  @Output() addNewPoster = new EventEmitter<void>();
  @Output() removePoster = new EventEmitter<number>();
  @Output() fillPoster = new EventEmitter<any[]>();
  srcRemove: string = "icon/delete.svg";
  ex: string = 'Plan iconique du film';

  onClickAddPoster(): void {
    this.addNewPoster.emit();
  }

  onClickRemove(id: number): void {
    this.removePoster.emit(id);
  }

  onClickFillPoster(id: number, srcPoster: string | ArrayBuffer | undefined | null): void {
    let tab: any[] = [id, srcPoster];
    this.fillPoster.emit(tab);
  }
  
}
