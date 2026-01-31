import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-action-key',
  standalone: true,
  imports: [NgClass],
  templateUrl: './action-key.component.html',
  styleUrl: './action-key.component.css'
})
export class ActionKeyComponent {

  @Input() srcImage !: string;
  @Input() keyIsPressed !: boolean;
  @Input() position: 'center' | 'left' | 'right' = 'center';

}
