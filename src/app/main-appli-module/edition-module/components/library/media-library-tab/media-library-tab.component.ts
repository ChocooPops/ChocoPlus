import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { MediaLibrary } from '../../../models/library/media-library.interface';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { LibraryService } from '../../../services/library/library.service';

interface FeedbackState {
  message: string;
  state: boolean;
}

@Component({
  selector: 'app-media-library-tab',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './media-library-tab.component.html',
  styleUrl: './media-library-tab.component.css'
})
export class MediaLibraryTabComponent {

  @Input() mediaLibraries: MediaLibrary[] = [];
  @Output() onMediaLibrary = new EventEmitter<void>();
  
  feedbackStates: (FeedbackState | null)[] = [];
  loadingStates: boolean[] = [];
  private feedbackTimers: ReturnType<typeof setTimeout>[] = [];

  srcIconSave: string = 'icon/save.svg';

  private readonly MIN_COL_WIDTH = 40;
  private readonly FEEDBACK_DURATION_MS = 4000;

  constructor(private readonly elementRef: ElementRef,
    private readonly libraryService: LibraryService
  ) { }

  ngOnChanges(): void {
    this.loadingStates = this.mediaLibraries.map(() => false);
    this.feedbackStates = this.mediaLibraries.map(() => null);
    this.feedbackTimers = this.mediaLibraries.map(() => undefined as any);
  }

  ngAfterViewInit(): void {
    this.initResizableColumns();
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

  saveVersion(mediaLibrary: MediaLibrary, index: number): void {
      if (this.loadingStates[index]) return;
  
      this.loadingStates[index] = true;
      this.feedbackStates[index] = null;
      clearTimeout(this.feedbackTimers[index]);
  
      // this.versionService.fetchUpdateVersionByOs(version).subscribe({
      //   next: (result: MessageReturnedModel) => {
      //     this.loadingStates[index] = false;
      //     this.feedbackStates[index] = {
      //       message: result.message,
      //       state: result.state
      //     };
      //     if (result.state && result.other) {
      //       const index = this.versions.findIndex((item) => item.os === version.os);
      //       if (index >= 0) this.versions[index] = result.other;
      //     }
      //     this.onMediaLibrary.emit();
      //     this.scheduleFeedbackClear(index);
      //   },
      //   error: () => {
      //     this.loadingStates[index] = false;
      //     this.feedbackStates[index] = {
      //       message: 'EDITION.ADVANCED_SETTINGS.ERROR',
      //       state: false
      //     };
      //     this.scheduleFeedbackClear(index);
      //   }
      // });
    }

    private scheduleFeedbackClear(index: number): void {
      this.feedbackTimers[index] = setTimeout(() => {
        this.feedbackStates[index] = null;
      }, this.FEEDBACK_DURATION_MS);
    }

    public getDimension(mediaLibrary: MediaLibrary): string {
      return `${mediaLibrary.width} * ${mediaLibrary.height} px`
    }
}
