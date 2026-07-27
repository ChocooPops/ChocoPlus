import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { InputTimeEditionComponent } from '../input-time-edition/input-time-edition.component';
import { ButtonDeleteComponent } from '../button-delete/button-delete.component';
import { NgClass } from '@angular/common';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { ScalePoster } from '../../../common-module/models/scale-poster.enum';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { EditNewsSeriesRunningComponent } from '../edit-news-series-running/edit-news-series-running.component';
import { TranslatePipe } from '@ngx-translate/core';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';

@Component({
  selector: 'app-edit-new-video-running',
  standalone: true,
  imports: [TranslatePipe, InputRadioButtonComponent, InputTimeEditionComponent, ButtonDeleteComponent, NgClass, EditNewsSeriesRunningComponent],
  templateUrl: './edit-new-video-running.component.html',
  styleUrls: ['./edit-new-video-running.component.css', '../../styles/edition.css']
})
export class EditNewVideoRunningComponent {

  backAvailable: string[] = [];
  currentBack!: string | undefined;
  isHovering: boolean = false;
  currentScale: ScalePoster = ScalePoster.SCALE_900w;
  poster !: string | undefined;
  series: SeriesModel | undefined = undefined;
  @Input() videoRunning !: NewsVideoRunningModel;
  @Output() modifyMediaLibraryId = new EventEmitter<SimpleModel>();
  @Output() modifyStartShow = new EventEmitter<SimpleModel>();
  @Output() modifyEndShow = new EventEmitter<SimpleModel>();
  @Output() modifyActivated = new EventEmitter<SimpleModel>();
  @Output() modifySrcBackground = new EventEmitter<SimpleModel>();
  @Output() deleteNews = new EventEmitter<number>();

  radioButton!: SimpleModel[];
  private static buttonId: number = 0;

  constructor(private readonly compressedPosterService: CompressedPosterService) { }

  ngOnInit(): void {
    this.radioButton = [
      {
        id: EditNewVideoRunningComponent.getButtonId(),
        name: 'YES',
        value: true,
        state: false
      },
      {
        id: EditNewVideoRunningComponent.getButtonId(),
        name: 'NO',
        value: false,
        state: false
      }
    ];

    if (this.videoRunning.activated) {
      this.radioButton[0].state = true;
    } else {
      this.radioButton[1].state = true;
    }

    this.currentBack = this.compressedPosterService.getBackgroundForNewsVideoRunning(this.videoRunning, this.currentScale);
    this.backAvailable = Array.from(
      new Set([
        ...(this.videoRunning.media.srcPosterHorizontal ?? []),
        ...(this.videoRunning.media.srcBackgroundImage ? [this.videoRunning.media.srcBackgroundImage] : [])
      ])
    );
    for (let i = 0; i < this.backAvailable.length; i++) {
      this.backAvailable[i] = this.compressedPosterService.insertIntoUrlBeforeFilename(this.backAvailable[i], this.currentScale);
    }
    this.poster = this.compressedPosterService.getLogoForMedia(this.videoRunning.media, ScalePoster.SCALE_500w);
    if (this.videoRunning.media.mediaType === MediaTypeModel.SERIES) {
      this.series = this.videoRunning.media as SeriesModel;
    }
  }

  onChangeStart(start: string): void {
    this.modifyStartShow.emit({ id: this.videoRunning.id, name: start });
  }
  onChangeEnd(end: string): void {
    this.modifyEndShow.emit({ id: this.videoRunning.id, name: end });
  }
  onChangeSrcBackground(srcBack: string): void {
    this.currentBack = srcBack;
    this.modifySrcBackground.emit({ id: this.videoRunning.id, name: srcBack });
  }
  onChangeMediaLibraryId(mediaLibraryId: string): void {
    this.modifyMediaLibraryId.emit({ id: this.videoRunning.id, name: mediaLibraryId });
  }
  onChangeActivated(id: number): void {
    let value!: boolean;
    const button: SimpleModel | undefined = this.radioButton.find((item) => item.id === id);
    if (button) {
      value = button.value;
    } else {
      value = true;
    }
    this.modifyActivated.emit({ id: this.videoRunning.id, name: 'activated', value: value });
  }
  onClickDelete(): void {
    this.deleteNews.emit(this.videoRunning.id);
  }

  mouseEnter(): void {
    this.isHovering = true;
  }

  mouseLeaving(): void {
    this.isHovering = false;
  }

  onErrorImageLogo(): void {
    this.poster = undefined;
  }

  private static getButtonId(): number {
    EditNewVideoRunningComponent.buttonId ++;
    return EditNewVideoRunningComponent.buttonId;
  }

}
