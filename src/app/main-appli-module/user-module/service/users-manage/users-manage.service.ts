import { Injectable } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { RoleModel } from '../../../../common-module/models/role.enum';
import { UserModel } from '../../dto/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, Observable, catchError, map, take, of } from 'rxjs';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersManageService {

  private id: number = 0;
  private readonly apiUrlUser: string = `${environment.apiUrlUser}`;
  private readonly urlAllUser: string = 'all-user';
  private readonly urlUpdateRoleByAdmin: string = 'update-role-by-admin';
  private readonly urlDeleteUserByAdmin: string = 'delete-user-by-admin';

  private userListSubject: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);
  private userList$: Observable<UserModel[]> = this.userListSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchAllUser().pipe(take(1)).subscribe(() => { });
  }

  public fetchAllUser(): Observable<void> {
    return this.http.get<any>(`${this.apiUrlUser}/${this.urlAllUser}`).pipe(
      map((data: UserModel[]) => {
        this.userListSubject.next(data);
      })
    )
  }

  public fetchUpdateRoleByAdmin(userId: number, role: RoleModel): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlUser}/${this.urlUpdateRoleByAdmin}/${userId}`, { role }).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.updateRoleIntoList(userId, role);
        }
        return data;
      }),
      catchError(() => {
        return of({
          id: -1,
          state: false,
          message: "Erreur avec le serveur"
        })
      })
    )
  }

  public fetchDeleteUserByAdmin(userId: number): Observable<MessageReturnedModel> {
    return this.http.delete<any>(`${this.apiUrlUser}/${this.urlDeleteUserByAdmin}/${userId}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.deleteUserIntoList(userId);
        }
        return data;
      }),
      catchError(() => {
        return of({
          id: -1,
          state: false,
          message: "Erreur avec le serveur"
        })
      })
    )
  }

  public getUserList(): Observable<UserModel[]> {
    return this.userList$;
  }

  private getId(): number {
    this.id++;
    return this.id;
  }

  private optionUser: SimpleModel[] = [
    {
      id: this.getId(),
      name: "Tous les utilisateurs",
      value: null,
      state: true,
    },
    {
      id: this.getId(),
      name: "Utilisateurs activés",
      value: [RoleModel.ADMIN, RoleModel.USER, RoleModel.FAMILY],
      state: false
    },
    {
      id: this.getId(),
      name: "Utilisateurs suspendus",
      value: [RoleModel.SUSPENDED],
      state: false
    },
    {
      id: this.getId(),
      name: "Demande d'inscription",
      value: [RoleModel.NOT_ACTIVATE],
      state: false
    }
  ];

  private actionUser: SimpleModel[] = [
    {
      id: this.getId(),
      name: "Devenir administrateur",
      value: RoleModel.ADMIN
    },
    {
      id: this.getId(),
      name: "Devenir un utilisateur classique",
      value: RoleModel.USER
    },
    {
      id: this.getId(),
      name: "Devenir un membre de la famille",
      value: RoleModel.FAMILY
    },
    {
      id: this.getId(),
      name: "Suspendre le compte",
      value: RoleModel.SUSPENDED
    },
    {
      id: this.getId(),
      name: "Désactiver le compte",
      value: RoleModel.NOT_ACTIVATE
    }
  ]

  public getOptionUser(): SimpleModel[] {
    return this.optionUser;
  }

  public getActionUser(): SimpleModel[] {
    return this.actionUser;
  }

  public getOptionSelected(): SimpleModel {
    const option: SimpleModel | undefined = this.optionUser.find((item: SimpleModel) => item.state === true);
    if (option) {
      return option
    } else {
      return this.optionUser[0];
    }
  }

  public getUserFiltered(optionSelected: SimpleModel, users: UserModel[]): UserModel[] {
    this.optionUser.forEach((option: SimpleModel) => {
      if (option.id === optionSelected.id) {
        option.state = true;
      } else {
        option.state = false;
      }
    })
    if (optionSelected.value) {
      const userTab: UserModel[] = users.filter((user: UserModel) => optionSelected.value.includes(user.role));
      return userTab;
    } else {
      return users;
    }
  }

  private deleteUserIntoList(userId: number): void {
    const userList: UserModel[] = this.userListSubject.value.filter((user: UserModel) => user.id !== userId);
    this.userListSubject.next(userList);
  }

  private updateRoleIntoList(userId: number, role: RoleModel): void {
    const userList: UserModel[] = this.userListSubject.value;
    userList.forEach((user: UserModel) => {
      if (user.id === userId) {
        user.role = role;
      }
    })
    this.userListSubject.next(userList);
  }

}
