import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuBarComponent } from './menu-module/components/menu-bar/menu-bar.component';
import { FooterComponent } from './common-module/components/footer/footer.component';
import { HiddenComponentService } from './menu-module/service/hidden-component/hidden-component.service';
import { SavePathService } from './common-module/services/save-path/save-path.service';
import { ScrollEventService } from './common-module/services/scroll-event/scroll-event.service';
import { filter } from 'rxjs';
import { MediaSelectedService } from './media-module/services/media-selected/media-selected.service';
import { MediaModel } from './media-module/models/media.interface';
import { MediaPageComponent } from './media-module/components/media-page/media-page/media-page.component';

@Component({
  selector: 'app-main-appli',
  standalone: true,
  imports: [RouterOutlet, MenuBarComponent, MediaPageComponent, FooterComponent],
  templateUrl: './main-appli.component.html',
  styleUrl: './main-appli.component.css'
})
export class MainAppliComponent {

  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;
  componentMustBeHidden !: boolean;

  private subscription: Subscription = new Subscription();
  mediaSelected: MediaModel | undefined = undefined;

  constructor(private readonly router: Router,
    private readonly hiddenComponentService: HiddenComponentService,
    private readonly savePathService: SavePathService,
    private readonly scrollEventService: ScrollEventService,
    private readonly renderer: Renderer2,
    private readonly mediaSelectedService: MediaSelectedService
  ) { }

  ngOnInit() {
    this.savePathService.setActualPath("/main-app/home");
    this.subscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          const url = event.urlAfterRedirects;
          const isReadVideo = url.includes('read-video');
          if (!isReadVideo) {
            this.savePathService.setActualPath(url);
          }
          this.scrollEventService.scrollToTop();
        })
    );

    this.subscription.add(
      this.hiddenComponentService.getIfComponentMustHidden().subscribe((bool) => {
        this.componentMustBeHidden = bool;
      })
    );

    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((media: MediaModel | undefined) => {
        this.mediaSelected = media;
      })
    )
  }

  ngAfterViewInit(): void {
    this.scrollEventService.setRenderer(this.renderer);
    this.scrollEventService.setContainerElement(this.containerRef.nativeElement);
    this.scrollEventService.setScrollListener();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
