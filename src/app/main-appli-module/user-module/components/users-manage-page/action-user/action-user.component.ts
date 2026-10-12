import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UserModel } from '../../../dto/user.model';
import { TitleCasePipe } from '@angular/common';
import { SimpleModel } from '../../../../../common-module/models/simple-model';
import { UsersManageService } from '../../../service/users-manage/users-manage.service';
import { RoleModel } from '../../../../../common-module/models/role.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-action-user',
  standalone: true,
  imports: [TitleCasePipe, TranslatePipe],
  templateUrl: './action-user.component.html',
  styleUrls: ['./action-user.component.css']
})
export class ActionUserComponent {

  @Input() user !: UserModel;
  @Output() emitOutClick = new EventEmitter<void>();
  @Output() emitActionClick = new EventEmitter<{ userId: number, role: RoleModel }>();
  actionUser: SimpleModel[] = [];

  constructor(private readonly usersManageService: UsersManageService,
    private readonly elementRef: ElementRef
  ) {
    this.actionUser = this.usersManageService.getActionUser()
  }

  onClickAction(role: RoleModel): void {
    if (role === this.user.role) {
      return;
    }
    this.emitActionClick.emit({ userId: this.user.id, role: role });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.emitOutClick.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.emitOutClick.emit();
  }

}
