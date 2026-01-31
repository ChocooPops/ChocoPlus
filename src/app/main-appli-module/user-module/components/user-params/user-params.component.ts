import { Component } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { UserModel } from '../../dto/user.model';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { UserParametersService } from '../../service/user-parameters/user-parameters.service';
import { MenuTabModel } from '../../../menu-module/model/menu-tab.interface';
import { NgClass } from '@angular/common';
import { RoleModel } from '../../../../common-module/models/role.enum';

@Component({
  selector: 'app-user-params',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './user-params.component.html',
  styleUrl: './user-params.component.css'
})
export class UserParamsComponent {

  currentUser: UserModel | undefined = undefined;
  subscription !: Subscription;
  userParams: MenuTabModel[] = [];
  RoleModel = RoleModel;
  disableParamAdmin: boolean = true;

  constructor(private userService: UserService,
    private userParametersService: UserParametersService
  ) {
    this.userParams = this.userParametersService.getAllUserTabMenu();
  }

  ngOnInit(): void {
    this.userParametersService.navigateToTabClicked();
    this.subscription = this.userService.getCurrentUser().subscribe((user: UserModel | undefined) => {
      if (user) {
        this.currentUser = user;
        if (user.role !== RoleModel.ADMIN && this.disableParamAdmin) {
          this.userParams = this.userParams.slice(0, this.userParams.length - 1);
          this.disableParamAdmin = false;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onNavigateUserTab(id: number): void {
    this.userParametersService.navigateByUserTabId(id);
  }

  srcDefaultPp: string = 'pp/pp.jpg';
  errorPpUser(): void {
    if (this.currentUser) {
      this.currentUser.profilPhoto = this.srcDefaultPp;
    }
  }

}
