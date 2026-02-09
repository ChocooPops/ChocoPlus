import { Component, HostListener } from '@angular/core';
import { MenuTmpComponent } from '../menu-module/components/menu-tmp/menu-tmp.component';
import { EditionParametersComponent } from './components/edition-parameters/edition-parameters.component';
import { RouterOutlet } from '@angular/router';
import { ScrollEventService } from '../common-module/services/scroll-event/scroll-event.service';
import { MenuTabService } from '../menu-module/service/menu-tab/menu-tab.service';
import { LoadOpeningPageService } from '../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../launch-module/models/page.enum';

@Component({
  selector: 'app-edition-page',
  standalone: true,
  imports: [RouterOutlet, MenuTmpComponent, EditionParametersComponent],
  templateUrl: './edition-page.component.html',
  styleUrl: './edition-page.component.css'
})
export class EditionPageComponent {

  isResizing = false;

  constructor(private scrollEventService: ScrollEventService,
    private menuTabService: MenuTabService,
    private loadOpeningPageService: LoadOpeningPageService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_EDITION);
  }

  ngOnInit(): void {
    this.scrollEventService.disableScrollEvent();
  }

  ngOnDestroy(): void {
    this.scrollEventService.enableScrollEvent();
  }

  onMouseDown(event: MouseEvent) {
    this.isResizing = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const container = document.querySelector('.container-edition') as HTMLElement;
    const left = document.querySelector('.container-parameters') as HTMLElement;
    const right = document.querySelector('.container-router-outlet') as HTMLElement;
    const containerOffsetLeft = container.offsetLeft;
    const pointerRelativeXpos = event.clientX - containerOffsetLeft;
    const newLeftWidth = (pointerRelativeXpos / container.clientWidth) * 100;
    left.style.width = `${newLeftWidth}%`;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }

}
