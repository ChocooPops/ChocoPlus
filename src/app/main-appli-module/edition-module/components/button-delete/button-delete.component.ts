import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-delete',
  standalone: true,
  imports: [],
  templateUrl: './button-delete.component.html',
  styleUrl: './button-delete.component.css'
})
export class ButtonDeleteComponent {

  @Input()
  displayPicture: boolean = false;

  srcImage: String = "icon/delete.svg";
  srcImagePressed: String = "icon/deletePressed.svg"
  isHover: boolean = false;

  onMouseEnter() {
    this.isHover = true;
  }

  onMouseLeave() {
    this.isHover = false;
  }

}
