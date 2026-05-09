import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LibraryLog } from '../../../models/library/library.interface';
import { JsonViewerComponent } from '../../json-viewer/json-viewer.component';

@Component({
  selector: 'app-log-viewer-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe, JsonViewerComponent],
  templateUrl: './log-viewer-modal.component.html',
  styleUrl: './log-viewer-modal.component.css'
})
export class LogViewerModalComponent {

  @Input() logData!: LibraryLog;
  @Input() libraryPath: string = '';

  @Output() close = new EventEmitter<void>();

  // modalX = 0;
  // modalY = 0;
  // modalW = 760;
  // modalH = 500;

  // private readonly MIN_W = 400;
  // private readonly MIN_H = 300;

  // private dragging = false;
  // private dragStartX = 0;
  // private dragStartY = 0;
  // private dragOriginX = 0;
  // private dragOriginY = 0;

  // private resizing = false;
  // private resizeEdge: string = '';
  // private resizeStartX = 0;
  // private resizeStartY = 0;
  // private resizeOriginW = 0;
  // private resizeOriginH = 0;
  // private resizeOriginX = 0;
  // private resizeOriginY = 0;

  // constructor(private readonly el: ElementRef) {}

  // ngOnInit(): void {
  //   const vw = window.innerWidth;
  //   const vh = window.innerHeight;
  //   this.modalW = Math.min(760, vw - 40);
  //   this.modalX = Math.round((vw - this.modalW) / 2);
  //   this.modalY = Math.round((vh - this.modalH) / 2);
  // }

  // @HostListener('document:keydown.escape')
  // onEscapeKey(): void { this.close.emit(); }

  // @HostListener('document:mousemove', ['$event'])
  // onMouseMove(e: MouseEvent): void {
  //   if (this.dragging) {
  //     this.modalX = this.dragOriginX + (e.clientX - this.dragStartX);
  //     this.modalY = this.dragOriginY + (e.clientY - this.dragStartY);
  //     this.clampPosition();
  //   }
  //   if (this.resizing) {
  //     this.doResize(e);
  //   }
  // }

  // @HostListener('document:mouseup')
  // onMouseUp(): void {
  //   this.dragging = false;
  //   this.resizing = false;
  //   this.resizeEdge = '';
  //   document.body.style.userSelect = '';
  //   document.body.style.cursor = '';
  // }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('lvm-overlay')) {
      this.close.emit();
    }
  }

  onCloseClick(): void { this.close.emit(); }

  // onHeaderMouseDown(e: MouseEvent): void {
  //   if ((e.target as HTMLElement).closest('.lvm-close-btn')) return;
  //   e.preventDefault();
  //   this.dragging = true;
  //   this.dragStartX = e.clientX;
  //   this.dragStartY = e.clientY;
  //   this.dragOriginX = this.modalX;
  //   this.dragOriginY = this.modalY;
  //   document.body.style.userSelect = 'none';
  // }

  // onResizeMouseDown(e: MouseEvent, edge: string): void {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   this.resizing = true;
  //   this.resizeEdge = edge;
  //   this.resizeStartX = e.clientX;
  //   this.resizeStartY = e.clientY;
  //   this.resizeOriginW = this.getModalEl()?.offsetWidth ?? this.modalW;
  //   this.resizeOriginH = this.getModalEl()?.offsetHeight ?? 500;
  //   this.resizeOriginX = this.modalX;
  //   this.resizeOriginY = this.modalY;
  //   document.body.style.userSelect = 'none';
  // }

  // private doResize(e: MouseEvent): void {
  //   const dx = e.clientX - this.resizeStartX;
  //   const dy = e.clientY - this.resizeStartY;
  //   const edge = this.resizeEdge;

  //   let newW = this.resizeOriginW;
  //   let newH = this.resizeOriginH;
  //   let newX = this.resizeOriginX;
  //   let newY = this.resizeOriginY;

  //   if (edge.includes('e')) newW = Math.max(this.MIN_W, this.resizeOriginW + dx);
  //   if (edge.includes('s')) newH = Math.max(this.MIN_H, this.resizeOriginH + dy);
  //   if (edge.includes('w')) {
  //     const candidate = Math.max(this.MIN_W, this.resizeOriginW - dx);
  //     newX = this.resizeOriginX + (this.resizeOriginW - candidate);
  //     newW = candidate;
  //   }
  //   if (edge.includes('n')) {
  //     const candidate = Math.max(this.MIN_H, this.resizeOriginH - dy);
  //     newY = this.resizeOriginY + (this.resizeOriginH - candidate);
  //     newH = candidate;
  //   }

  //   this.modalW = newW;
  //   this.modalH = newH;
  //   this.modalX = newX;
  //   this.modalY = newY;
  // }

  // get modalStyle(): Record<string, string> {
  //   return {
  //     left: `${this.modalX}px`,
  //     top: `${this.modalY}px`,
  //     width: `${this.modalW}px`,
  //     ...(this.modalH > 0 ? { height: `${this.modalH}px` } : {})
  //   };
  // }

  // private clampPosition(): void {
  //   const vw = window.innerWidth;
  //   const vh = window.innerHeight;
  //   const w = this.getModalEl()?.offsetWidth ?? this.modalW;
  //   const h = this.getModalEl()?.offsetHeight ?? 400;
  //   this.modalX = Math.max(0, Math.min(this.modalX, vw - w));
  //   this.modalY = Math.max(0, Math.min(this.modalY, vh - h));
  // }

  // private getModalEl(): HTMLElement | null {
  //   return this.el.nativeElement.querySelector('.lvm-modal');
  // }
}