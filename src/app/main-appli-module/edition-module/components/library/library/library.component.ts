import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Library } from '../../../models/library/library.interface';
import { MediaTypeModel } from '../../../../media-module/models/media-type.enum';
import { NgClass } from '@angular/common';
import { StateLibrary } from '../../../models/library/state-library.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {

  @Input() library!: Library;
  @Input() idSelected: string | null = null;
  
  @Output() handleRefresh = new EventEmitter<string>();
  @Output() handleDelete = new EventEmitter<string>();
  @Output() selected = new EventEmitter<string>();

  MediaType = MediaTypeModel;
  StateLibrary = StateLibrary;


  setHandleRefresh(event: MouseEvent): void {
    event.stopPropagation();
    this.handleRefresh.emit(this.library.id);
  }

  setHandleDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.handleDelete.emit(this.library.id);
  }

  onClickLibrary(): void {
    this.selected.emit(this.library.id);
  }

}
