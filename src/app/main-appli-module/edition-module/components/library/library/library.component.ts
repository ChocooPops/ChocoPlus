// library.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Library } from '../../../models/library/library.interface';
import { MediaTypeModel } from '../../../../media-module/models/media-type.enum';
import { NgClass } from '@angular/common';
import { StateLibrary } from '../../../models/library/state-library.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { LogViewerModalComponent } from '../log-viewer-modal/log-viewer-modal.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [NgClass, TranslatePipe, LogViewerModalComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {

  @Input() library!: Library;
  @Input() idSelected: Library | null = null;

  @Output() handleRefresh = new EventEmitter<Library>();
  @Output() handleDelete = new EventEmitter<string>();
  @Output() selected = new EventEmitter<Library>();

  MediaType = MediaTypeModel;
  StateLibrary = StateLibrary;

  isLogModalOpen = false;

  setHandleRefresh(event: MouseEvent): void {
    event.stopPropagation();
    this.handleRefresh.emit(this.library);
  }

  setHandleDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.handleDelete.emit(this.library.id);
  }

  onClickLibrary(): void {
    this.selected.emit(this.library);
  }

  openLogModal(event: MouseEvent): void {
    event.stopPropagation();
    this.isLogModalOpen = true;
  }

  closeLogModal(): void {
    this.isLogModalOpen = false;
  }

  get logStatus(): 'success' | 'error' | 'warning' | 'in_progress' | 'none' {
    return this.library.log?.status ?? 'none';
  }

  get logHasErrors(): boolean {
    return (this.library.log?.stats?.errors ?? 0) > 0;
  }

  get logHasWarnings(): boolean {
    return (this.library.log?.stats?.warnings ?? 0) > 0;
  }

  get logLastRefresh(): string | null {
    if (!this.library.log?.lastRefresh) return null;
    return new Date(this.library.log.lastRefresh).toLocaleString();
  }
}