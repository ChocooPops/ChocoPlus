import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { take } from 'rxjs';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { UserService } from '../../../../user-module/service/user/user.service';
import { MediaModel } from '../../../models/media.interface';

@Component({
  selector: 'app-mylist-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './mylist-button.component.html',
  styleUrl: '../../../../common-module/styles/movie-button.css'
})
export class MylistButtonComponent {

  @Input()
  typeButton: boolean = false;

  @Input()
  typeDisplaying: boolean = false;

  @Input()
  media !: MediaModel;

  @Input()
  isInList: boolean = false;

  isHover: boolean = false;
  srcNotListEnter: string = 'icon/notInMyListEnter.svg';
  srcNotListLeave: string = 'icon/notInMyListLeave.svg';
  srcInListEnter: string = 'icon/inMyListEnter.svg';
  srcInListLeave: string = 'icon/inMyListLeave.svg';
  favoris: string = "icon/favoris.svg";
  notFavoris: string = 'icon/not-favoris.svg';

  constructor(private userService: UserService) { }

  onMouseEnter(): void {
    this.isHover = true;
  }

  onMouseLeave(): void {
    this.isHover = false;
  }

  onClick(): void {
    if (this.media) {
      this.userService.fetchToggleMediaIntoList(this.media).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
        if (data.id >= 0) {
          this.isInList = data.state;
        }
      });
    }
  }

}
