import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface SelectOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-input-select',
  standalone: true,
  imports: [],
  templateUrl: './input-select.component.html',
  styleUrl: './input-select.component.css'
})
export class InputSelectComponent {

  @Input() options: SelectOption[] = [];
  @Input() selectedId: number | null = null;
  @Input() placeholder: string = '---';

  @Output() changeEmit = new EventEmitter<number>();

  isOpen: boolean = false;

  get selectedOption(): SelectOption | undefined {
    return this.options.find(o => o.id === this.selectedId);
  }

  toggle(): void { this.isOpen = !this.isOpen; }
  close(): void  { this.isOpen = false; }

  select(option: SelectOption): void {
    this.changeEmit.emit(option.id);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.input-select')) {
      this.close();
    }
  }

}
