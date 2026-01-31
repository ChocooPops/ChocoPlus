import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input-image-edition',
  standalone: true,
  imports: [NgClass],
  templateUrl: './input-image-edition.component.html',
  styleUrl: './input-image-edition.component.css'
})
export class InputImageEditionComponent {

  @Output()
  inputChange = new EventEmitter<string | ArrayBuffer | undefined | null>()

  @Input()
  typeInputImage: number = 1;

  @Input()
  exText: string = "";

  @Input()
  srcImageAdded: string | ArrayBuffer | undefined | null = null;

  @Input() displayRemoveButton: boolean = true;

  srcBtDelete: string = "icon/delete.svg";
  srcImageInput: string = "icon/pictureInput.svg";
  classInputPoster: string = "inputPoster";
  classInputLogo: string = "inputLogo";
  classInputBackgroundImage: string = "inputBackGroundImage";
  classInputSeries: string = "inputSeries";
  classInputActual !: string;
  isDragging: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['srcImageAdded']) {
      if (this.srcImageAdded && typeof this.srcImageAdded === 'string' && !this.isBase64Image(this.srcImageAdded)) {
        this.srcImageAdded = `${this.srcImageAdded}?t=${Date.now()}`;
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      const reader = new FileReader();
      this.srcImageAdded = null;
      reader.onload = (e) => {
        if (e.target?.result !== undefined) {
          this.srcImageAdded = e.target.result;
          this.inputChange.emit(this.srcImageAdded);
        }
      };
      reader.readAsDataURL(file);
    }
    this.isDragging = false;
  }

  ngOnInit() {
    if (this.typeInputImage === 2) {
      this.classInputActual = this.classInputLogo;
    } else if (this.typeInputImage === 3) {
      this.classInputActual = this.classInputBackgroundImage;
    } else if (this.typeInputImage === 4) {
      this.classInputActual = this.classInputSeries;
    } else {
      this.classInputActual = this.classInputPoster;
    }
  }

  onClickRemove() {
    this.srcImageAdded = null;
    this.inputChange.emit(undefined);
  }

  onErrorImage(): void {
    this.inputChange.emit(undefined);
  }

  private isBase64Image(str: string): boolean {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
  }
}
