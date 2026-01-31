import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonAddComponent } from '../button-add/button-add.component';
import { EditSeasonModel } from '../../models/series/edit-season.interface';
import { NgClass } from '@angular/common';
import { ButtonDeleteComponent } from '../button-delete/button-delete.component';

@Component({
  selector: 'app-edit-list-season',
  standalone: true,
  imports: [ButtonAddComponent, NgClass, ButtonDeleteComponent],
  templateUrl: './edit-list-season.component.html',
  styleUrl: './edit-list-season.component.css'
})
export class EditListSeasonComponent {

  @Input() seasons: EditSeasonModel[] = [];
  @Input() seasonSelected !: number;

  @Output() addSeason = new EventEmitter<void>();
  @Output() deleteSeason = new EventEmitter<number>();
  @Output() selectSeason = new EventEmitter<number>();

  onClickAddNewSeason(): void {
    this.addSeason.emit();
  }

  onClickDeleteSeason(index: number): void {
    this.deleteSeason.emit(index);
  }

  onSelectSeason(index: number): void {
    this.selectSeason.emit(index);
  }

}
