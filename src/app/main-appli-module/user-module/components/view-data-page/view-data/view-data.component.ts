import { Component } from '@angular/core';
import { GraphComponent } from '../graph/graph.component';
import { UserParametersService } from '../../../service/user-parameters/user-parameters.service';
import { MenuType } from '../../../../menu-module/model/menu-type.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-view-data',
  standalone: true,
  imports: [GraphComponent, TranslatePipe],
  templateUrl: './view-data.component.html',
  styleUrl: './view-data.component.css'
})
export class ViewDataComponent {

  loadData: boolean = false;

  constructor(private readonly userParametersService: UserParametersService) {
    this.userParametersService.initAllClickedValue(MenuType.META_DATA);
  }

  onClick(): void {
    this.loadData = true;
  }

}
