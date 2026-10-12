import { Component, ViewChild } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { UserModel } from '../../../dto/user.model';
import { UpperCasePipe, TitleCasePipe } from '@angular/common';
import { RoleModel } from '../../../../../common-module/models/role.enum';
import { SimpleModel } from '../../../../../common-module/models/simple-model';
import { UsersManageService } from '../../../service/users-manage/users-manage.service';
import { ActionUserComponent } from '../action-user/action-user.component';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { PopupComponent } from '../../../../edition-module/components/popup/popup.component';
import { DetailUserComponent } from '../detail-user/detail-user.component';
import { UserParametersService } from '../../../service/user-parameters/user-parameters.service';
import { MenuType } from '../../../../menu-module/model/menu-type.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { InputOptionSelectorComponent } from '../../user-parameters-app/input-option-selector/input-option-selector.component';

@Component({
  selector: 'app-users-manage',
  standalone: true,
  imports: [TranslatePipe, UpperCasePipe, TitleCasePipe, ActionUserComponent, PopupComponent, DetailUserComponent, InputOptionSelectorComponent],
  templateUrl: './users-manage.component.html',
  styleUrls: ['./users-manage.component.css']
})
export class UsersManageComponent {

  subscription !: Subscription;
  userList: UserModel[] = [];
  actionList: boolean[] = [];
  detailList: boolean[] = [];
  RoleModel = RoleModel;
  options: SimpleModel[] = [];
  srcReset: string = 'icon/modify.svg';
  optionSelected !: SimpleModel;

  @ViewChild(PopupComponent) popupRef !: PopupComponent;

  constructor(private readonly usersManageService: UsersManageService,
    private readonly userParametersService: UserParametersService
  ) {
    this.userParametersService.initAllClickedValue(MenuType.MANAGEMENT_USER)
    this.options = this.usersManageService.getOptionUser();
  }

  ngOnInit(): void {
    this.optionSelected = this.usersManageService.getOptionSelected();
    this.getAllUserByOption();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  srcDefaultPp: string = 'pp/pp.jpg';
  errorPpUser(id: number): void {
    const index: number = this.userList.findIndex((item: UserModel) => item.id === id);
    if (index >= 0) {
      this.userList[index].profilPhoto = this.srcDefaultPp;
    }
  }

  private getAllUserByOption(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.usersManageService.getUserList().subscribe((data: UserModel[]) => {
      this.userList = this.usersManageService.getUserFiltered(this.optionSelected, data);
      this.setActionList();
      this.setDetailList();
    });
  }

  onClickReset(): void {
    this.usersManageService.fetchAllUser().pipe(take(1)).subscribe(() => { });
  }

  private setActionList(): void {
    this.actionList = [];
    this.userList.forEach(() => {
      this.actionList.push(false);
    })
  }

  private setDetailList(): void {
    this.detailList = [];
    this.userList.forEach(() => {
      this.detailList.push(false);
    })
  }

  public displayActionByUser(index: number): void {
    for (let i = 0; i < this.actionList.length; i++) {
      if (i === index) {
        this.actionList[i] = true;
      } else {
        this.actionList[i] = false;
      }
    }
  }

  public displayDetailByUser(index: number): void {
    this.detailList[index] = !this.detailList[index];
  }

  public hiddenActionByIndex(index: number): void {
    this.actionList[index] = false;
  }

  onChangeOption(id: number): void {
    const option: SimpleModel | undefined = this.options.find((item: SimpleModel) => item.id === id);
    if (option) {
      this.optionSelected = option;
      this.getAllUserByOption();
    }
  }

  private currentUserId: number | undefined = undefined;
  onClickDelete(userId: number): void {
    this.popupRef.resetPopup();
    this.popupRef.setDisplayButton(true);
    this.popupRef.setDisplayPopup(true);
    this.popupRef.setMessage("USER.USER_MANAGEMENT.WARNING_DELETE_USER \n " + this.getUserNameById(userId), undefined);
    this.currentUserId = userId;
  }

  onEmitDelete(): void {
    if (this.currentUserId) {
      this.popupRef.setDisplayButton(false);
      this.popupRef.setMessage(undefined, undefined);
      this.usersManageService.fetchDeleteUserByAdmin(this.currentUserId).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
        this.popupRef.setMessage(data.message, data.state);
        this.popupRef.setEndTask(true);
      });
    } else {
      this.popupRef.setMessage("USER.USER_MANAGEMENT.ERROR_ID", false);
      this.popupRef.setEndTask(true);
    }
    this.currentUserId = undefined;
  }

  private getUserNameById(userId: number): string {
    return this.userList.find((user: UserModel) => user.id === userId)?.pseudo || '';
  }

  onClickAction(index: number, action: { userId: number, role: RoleModel }): void {
    this.popupRef.resetPopup();
    this.popupRef.setDisplayPopup(true);
    this.popupRef.setMessage(undefined, undefined);
    this.actionList[index] = false;
    this.usersManageService.fetchUpdateRoleByAdmin(action.userId, action.role).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      this.popupRef.setMessage(data.message, data.state);
      this.popupRef.setEndTask(true);
    });
  }

}
