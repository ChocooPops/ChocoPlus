import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UserModel } from '../../../dto/user.model';
import { TitleCasePipe } from '@angular/common';
import { UpperCasePipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { SimpleModel } from '../../../../../common-module/models/simple-model';
import { UsersManageService } from '../../../service/users-manage/users-manage.service';
import { RoleModel } from '../../../../../common-module/models/role.enum';

@Component({
  selector: 'app-action-user',
  standalone: true,
  imports: [TitleCasePipe, UpperCasePipe, NgClass],
  templateUrl: './action-user.component.html',
  styleUrls: ['./action-user.component.css', '../../../styles/role.css']
})
export class ActionUserComponent {

  @Input() user !: UserModel;
  @Input() back !: string;
  @Output() emitOutClick = new EventEmitter<void>();
  @Output() emitActionClick = new EventEmitter<{ userId: number, role: RoleModel }>();
  actionUser: SimpleModel[] = [];
  RoleModel = RoleModel;

  constructor(private usersManageService: UsersManageService,
    private elementRef: ElementRef
  ) {
    this.actionUser = this.usersManageService.getActionUser()
  }

  onClickAction(role: RoleModel): void {
    this.emitActionClick.emit({ userId: this.user.id, role: role });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.emitOutClick.emit();
    }
  }

}
