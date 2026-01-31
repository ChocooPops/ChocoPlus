import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { InputTextAreaEditionComponent } from '../input-text-area-edition/input-text-area-edition.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputDateComponent } from '../input-date/input-date.component';
import { EditEpisodeModel } from '../../models/series/edit-episode.interface';
import { ButtonDeleteComponent } from '../button-delete/button-delete.component';
import { NgClass } from '@angular/common';
import { ButtonMoveComponent } from '../button-move/button-move.component';

@Component({
  selector: 'app-edit-episode',
  standalone: true,
  imports: [ButtonDeleteComponent, ButtonMoveComponent, NgClass, InputImageEditionComponent, InputTextAreaEditionComponent, InputTextEditionComponent, InputDateComponent, NgClass],
  templateUrl: './edit-episode.component.html',
  styleUrls: ['./edit-episode.component.css', '../../styles/edition.css']
})
export class EditEpisodeComponent {

  @Input() episode !: EditEpisodeModel;
  @Output() changeJellyfinId = new EventEmitter<string>();
  @Output() changePoster = new EventEmitter<string | ArrayBuffer | undefined | null>();
  @Output() changeTitle = new EventEmitter<string>();
  @Output() changeDescription = new EventEmitter<string>();
  @Output() changeDate = new EventEmitter<Date>();
  @Output() deleteEpisode = new EventEmitter<void>();
  @Output() moveToTop = new EventEmitter<void>();
  @Output() moveToBottom = new EventEmitter<void>();

  maxLength: number = 500;
  isHovering !: boolean;

  onChangeJellyfinId(jellyfinId: string): void {
    this.changeJellyfinId.emit(jellyfinId);
  }
  onChangePoster(poster: string | ArrayBuffer | undefined | null): void {
    this.changePoster.emit(poster);
  }
  onChangeTitle(title: string): void {
    this.changeTitle.emit(title);
  }
  onChangeDescritpion(description: string): void {
    this.changeDescription.emit(description);
  }
  onChangeDate(date: Date): void {
    this.changeDate.emit(date);
  }
  onDeleteEpisode(): void {
    this.deleteEpisode.emit();
  }

  onMouseEnter(): void {
    this.isHovering = true;
  }
  onMouseLeaving(): void {
    this.isHovering = false;
  }

  onMoveToTop(): void {
    this.moveToTop.emit();
  }
  onMoveToBottom(): void {
    this.moveToBottom.emit();
  }

}
