import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { MediaCreditModel } from '../../../media-module/models/media-credit.interface';
import { JobModel } from '../../../media-module/models/job.eum';
import { FormsModule } from '@angular/forms';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-credits-table',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './credits-table.component.html',
  styleUrl: './credits-table.component.css',
})
export class CreditsTableComponent {

  @Input() credits: MediaCreditModel[] = [];
  @Input() mediaType!: MediaTypeModel;
  @Output() onCreditChanged  = new EventEmitter<MediaCreditModel[]>();

  private readonly MIN_COL_WIDTH = 40;

  jobOptions: JobModel[] = Object.values(JobModel);

  openDropdown: string | null = null;
  isBodyVisible: boolean = true;
  MediaType = MediaTypeModel;
  
  constructor(private readonly elementRef: ElementRef) { }

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

  toggleBodyVisibility(): void {
    this.isBodyVisible = !this.isBodyVisible;
  }

  toggleDropdown(key: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.openDropdown = null;
    }
  }

  selectJob(credit: MediaCreditModel, job: JobModel, event: MouseEvent): void {
    event.stopPropagation();
    credit.job = job;
    this.openDropdown = null;
    this.onCreditChanged.emit(this.credits);
  }

  closeDropdowns(): void {
    this.openDropdown = null;
  }

  addCredit(): void {
    const newCredit: MediaCreditModel = {
      id: Date.now(),
      tmdbId: 0,
      fullName: '',
      originalFullName: '',
      character: null,
      srcPoster: null,
      job: JobModel.ACTOR,
      order: this.credits.length + 1,
    };
    this.credits.push(newCredit);
    this.onCreditChanged.emit(this.credits);
  }

  removeCredit(index: number): void {
    this.credits.splice(index, 1);
    this.onCreditChanged.emit(this.credits);
  }

  onFieldChange(credit: MediaCreditModel): void {
    this.onCreditChanged.emit(this.credits);
  }

}