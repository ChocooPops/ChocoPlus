import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bt-classic',
  standalone: true,
  imports: [],
  templateUrl: './bt-classic.component.html',
  styleUrl: './bt-classic.component.css'
})
export class BtClassicComponent {

  @Input() srcFirstImage !: string;
  @Input() srcSecondImage !: string;
  @Input() state: boolean = true;
  @Output() hasBeenClicked = new EventEmitter<any>();

  onClicked(): void {
    this.hasBeenClicked.emit();
  }

}
