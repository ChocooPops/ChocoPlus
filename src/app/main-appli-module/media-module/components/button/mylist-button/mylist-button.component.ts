import { Component, Input, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subject, take, takeUntil, filter } from 'rxjs';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { UserService } from '../../../../user-module/service/user/user.service';
import { MediaModel } from '../../../models/media.interface';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-mylist-button',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './mylist-button.component.html',
  styleUrls: ['./mylist-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class MylistButtonComponent {

  @Input() cursor: boolean = true;
  @Input() typeButton: boolean = false;
  @Input() typeDisplaying: boolean = false;
  @Input() media!: MediaModel;

  isInList: boolean = false;

  srcNotListEnter: string = 'icon/notInMyListEnter.svg';
  srcNotListLeave: string = 'icon/notInMyListLeave.svg';
  srcInListEnter: string = 'icon/inMyListEnter.svg';
  srcInListLeave: string = 'icon/inMyListLeave.svg';
  favoris: string = "icon/favoris.svg";
  notFavoris: string = 'icon/not-favoris.svg';

  private destroy$ = new Subject<void>();

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.userService.getMyListChanged().pipe(
      filter((changedId: number) => changedId === this.media.id),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isInList = this.userService.mediaIsIntoList(this.media.id);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['media']) {
      if (this.media) {
        this.isInList = this.userService.mediaIsIntoList(this.media.id);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClick(): void {
    if (!this.cursor) return;
    if (this.media && this.media.id && this.media.id > 0) {
      this.userService.fetchToggleMediaIntoList(this.media).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      });
    }
  }
}