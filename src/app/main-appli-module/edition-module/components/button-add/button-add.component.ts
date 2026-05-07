import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-button-add',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './button-add.component.html',
  styleUrl: './button-add.component.css'
})
export class ButtonAddComponent {

  @Input() text: string | null = null;

}
