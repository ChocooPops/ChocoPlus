import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { VersionModel } from '../../../../launch-module/models/version.interface';
import { FormsModule } from '@angular/forms';
import { VersionService } from '../../../../common-module/services/service/version.service';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';

interface FeedbackState {
  message: string;
  state: boolean;
}

@Component({
  selector: 'app-edit-version',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-version.component.html',
  styleUrl: './edit-version.component.css'
})
export class EditVersionComponent {

  @Input() versions: VersionModel[] = [];
  @Output() onVersion = new EventEmitter<void>();

  loadingStates: boolean[] = [];
  feedbackStates: (FeedbackState | null)[] = [];
  srcIconSave: string = 'icon/save.svg';

  private feedbackTimers: ReturnType<typeof setTimeout>[] = [];
  private readonly MIN_COL_WIDTH = 40;
  private readonly FEEDBACK_DURATION_MS = 4000;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly versionService: VersionService
  ) { }

  ngOnChanges(): void {
    this.loadingStates = this.versions.map(() => false);
    this.feedbackStates = this.versions.map(() => null);
    this.feedbackTimers = this.versions.map(() => undefined as any);
  }

  ngAfterViewInit(): void {
    this.initResizableColumns();
  }

  ngOnDestroy(): void {
    this.feedbackTimers.forEach((timer) => clearTimeout(timer));
  }

  saveVersion(version: VersionModel, index: number): void {
    if (this.loadingStates[index]) return;

    this.loadingStates[index] = true;
    this.feedbackStates[index] = null;
    clearTimeout(this.feedbackTimers[index]);

    this.versionService.fetchUpdateVersionByOs(version).subscribe({
      next: (result: MessageReturnedModel) => {
        this.loadingStates[index] = false;
        this.feedbackStates[index] = {
          message: result.message,
          state: result.state
        };
        if (result.state && result.other) {
          const index = this.versions.findIndex((item) => item.os === version.os);
          if (index >= 0) this.versions[index] = result.other;
        }
        this.onVersion.emit();
        this.scheduleFeedbackClear(index);
      },
      error: () => {
        this.loadingStates[index] = false;
        this.feedbackStates[index] = {
          message: 'Une erreur est survenue.',
          state: false
        };
        this.scheduleFeedbackClear(index);
      }
    });
  }

  private scheduleFeedbackClear(index: number): void {
    this.feedbackTimers[index] = setTimeout(() => {
      this.feedbackStates[index] = null;
    }, this.FEEDBACK_DURATION_MS);
  }

  private initResizableColumns(): void {
    const handles = this.elementRef.nativeElement.querySelectorAll('.ct-resize-handle');
    handles.forEach((handle: HTMLElement) => {
      let startX = 0;
      let startWidth = 0;
      let th: HTMLElement | null = null;

      const onMouseMove = (e: MouseEvent) => {
        if (!th) return;
        const newWidth = Math.max(this.MIN_COL_WIDTH, startWidth + (e.clientX - startX));
        th.style.width = newWidth + 'px';
      };

      const onMouseUp = () => {
        handle.classList.remove('is-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        th = null;
      };

      handle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        th = handle.closest('th') as HTMLElement;
        startX = e.clientX;
        startWidth = th.offsetWidth;
        handle.classList.add('is-resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

}