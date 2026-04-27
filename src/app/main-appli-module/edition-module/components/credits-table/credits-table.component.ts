import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreditModel } from '../../../media-module/models/credit.interface';
import { JobModel } from '../../../media-module/models/job.eum';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credits-table',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './credits-table.component.html',
  styleUrl: './credits-table.component.css',
})
export class CreditsTableComponent {

  @Input() credits: CreditModel[] = [];
  @Output() onCreditChanged  = new EventEmitter<CreditModel[]>();

  jobOptions: JobModel[] = Object.values(JobModel);

  openDropdown: string | null = null;

  toggleDropdown(key: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  selectJob(credit: CreditModel, job: JobModel, event: MouseEvent): void {
    event.stopPropagation();
    credit.job = job;
    this.openDropdown = null;
    this.onCreditChanged.emit(this.credits);
  }

  closeDropdowns(): void {
    this.openDropdown = null;
  }

  addCredit(): void {
    const newCredit: CreditModel = {
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

  onFieldChange(credit: CreditModel): void {
    this.onCreditChanged.emit(this.credits);
  }

}
