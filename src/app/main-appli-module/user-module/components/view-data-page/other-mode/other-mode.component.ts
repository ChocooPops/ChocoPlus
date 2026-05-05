import { Component, Input } from '@angular/core';
import { GraphService } from '../../../service/graph/graph.service';
import { SimpleModel } from '../../../../../common-module/models/simple-model';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-other-mode',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './other-mode.component.html',
  styleUrl: './other-mode.component.css'
})
export class OtherModeComponent {

  @Input() displayOtherMode: boolean = false;

  public modesGraph: SimpleModel[] = [];

  constructor(private graphService: GraphService) {
    this.modesGraph = this.graphService.getModeGraph();
  }

  loadNewGraph(id: number): void {
    this.graphService.loadNewGraph(id);
  }

}
