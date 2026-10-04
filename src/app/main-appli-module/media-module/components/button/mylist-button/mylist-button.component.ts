import { Component, Input, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subject, take, takeUntil, filter, finalize } from 'rxjs';
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
  @Input() activated: boolean = true;

  isInList: boolean = false;
  isToggling: boolean = false;

  public readonly srcNotListEnter: string = 'icon/notInMyListEnter.svg';
  public readonly srcNotListLeave: string = 'icon/notInMyListLeave.svg';
  public readonly srcInListEnter: string = 'icon/inMyListEnter.svg';
  public readonly srcInListLeave: string = 'icon/inMyListLeave.svg';
  public readonly favoris: string = "icon/favoris.svg";
  public readonly notFavoris: string = 'icon/not-favoris.svg';

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
    if (!this.activated || !this.cursor || this.isToggling) return;
    if (!this.media || this.media.id <= 0) return;

    this.isToggling = true;
    this.userService.fetchToggleMediaIntoList(this.media).pipe(
      take(1),
      finalize(() => this.isToggling = false)
    ).subscribe();
  }

}