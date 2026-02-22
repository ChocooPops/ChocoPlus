import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subject, take, takeUntil, filter } from 'rxjs';
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

  @Input() typeButton: boolean = false;
  @Input() typeDisplaying: boolean = false;
  @Input() media!: MediaModel;

  isInList: boolean = false;
  isHover: boolean = false;

  srcNotListEnter: string = 'icon/notInMyListEnter.svg';
  srcNotListLeave: string = 'icon/notInMyListLeave.svg';
  srcInListEnter: string = 'icon/inMyListEnter.svg';
  srcInListLeave: string = 'icon/inMyListLeave.svg';
  favoris: string = "icon/favoris.svg";
  notFavoris: string = 'icon/not-favoris.svg';

  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.isInList = this.userService.mediaIsIntoList(this.media.id);

    this.userService.getMyListChanged().pipe(
      filter((changedId: number) => changedId === this.media.id),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isInList = this.userService.mediaIsIntoList(this.media.id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMouseEnter(): void { 
    this.isHover = true; 
  }
  onMouseLeave(): void { 
    this.isHover = false; 
  }

  onClick(): void {
    if (this.media) {
      this.userService.fetchToggleMediaIntoList(this.media).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      });
    }
  }
}