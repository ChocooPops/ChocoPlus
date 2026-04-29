import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { MediaCreditModel } from '../../../media-module/models/media-credit.interface';
import { JobModel } from '../../../media-module/models/job.eum';
import { FormsModule } from '@angular/forms';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';

@Component({
  selector: 'app-credits-table',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './credits-table.component.html',
  styleUrl: './credits-table.component.css',
})
export class CreditsTableComponent {

  @Input() credits: MediaCreditModel[] = [];
  @Input() mediaType!: MediaTypeModel;
  @Output() onCreditChanged  = new EventEmitter<MediaCreditModel[]>();

  jobOptions: JobModel[] = Object.values(JobModel);

  openDropdown: string | null = null;
  MediaType = MediaTypeModel;

  constructor(private readonly elementRef: ElementRef) { }

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
