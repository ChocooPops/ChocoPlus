import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button-orientation',
  standalone: true,
  imports: [],
  templateUrl: './button-orientation.component.html',
  styleUrl: './button-orientation.component.css'
})
export class ButtonOrientationComponent {

  @Input() type !: number;
  @Output() hasBeenClick = new EventEmitter<number>();
  isHover: boolean = false;

  folder: string = "icon/";

  srcImageReleased: string = '';
  srcImagePressed: string = '';

  srcTopReleased: string = this.folder + 'top-released.svg';
  srcCenterReleased: string = this.folder + 'center-released.svg';
  srcBottomReleased: string = this.folder + 'bottom-released.svg';

  srcTopPressed: string = this.folder + 'top-pressed.svg';
  srcCenterPressed: string = this.folder + 'center-pressed.svg';
  srcBottomPressed: string = this.folder + 'bottom-pressed.svg';

  ngOnInit(): void {
    if (this.type === 1) {
      this.srcImagePressed = this.srcTopPressed;
      this.srcImageReleased = this.srcTopReleased;
    } else if (this.type === 2) {
      this.srcImagePressed = this.srcBottomPressed;
      this.srcImageReleased = this.srcBottomReleased;
    } else {
      this.srcImagePressed = this.srcCenterPressed;
      this.srcImageReleased = this.srcCenterReleased;
    }
  }

  onMouseEnter(): void {
    this.isHover = true;
  }

  onMouseLeave(): void {
    this.isHover = false;
  }

  onClick(): void {
    this.hasBeenClick.emit(this.type);
  }

}
