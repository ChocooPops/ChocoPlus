import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserModel } from '../../../dto/user.model';
import { UserHistoricComponent } from '../../user-historic-page/user-historic/user-historic.component';
import { TranslatePipe } from '@ngx-translate/core';
import { SimpleModel } from '../../../../../common-module/models/simple-model';
import { InputOptionSelectorComponent } from '../../user-parameters-app/input-option-selector/input-option-selector.component';

@Component({
  selector: 'app-detail-user',
  standalone: true,
  imports: [DatePipe, UserHistoricComponent, TranslatePipe, InputOptionSelectorComponent],
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.css']
})
export class DetailUserComponent {

  private readonly idInfo: number = 1;
  private readonly idStats: number = 2;

  @Input() user !: UserModel;
  detailType: boolean = false;
  srcDefaultPp: string = 'pp/pp.jpg';

  detailOptions: SimpleModel[] = [
    { id: this.idInfo, name: 'USER.USER_MANAGEMENT.INFO', state: true },
    { id: this.idStats, name: 'USER.USER_MANAGEMENT.STATS', state: false }
  ];

  onChangeDetail(id: number): void {
    this.detailType = id === this.idStats;
  }

  errorPp(event: Event): void {
    (event.target as HTMLImageElement).src = this.srcDefaultPp;
  }

}
