import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuBarComponent } from './menu-module/components/menu-bar/menu-bar.component';
import { FooterComponent } from './common-module/components/footer/footer.component';
import { HiddenComponentService } from './menu-module/service/hidden-component/hidden-component.service';
import { ScrollEventService } from './common-module/services/scroll-event/scroll-event.service';
import { filter } from 'rxjs';
import { MediaSelectedService } from './media-module/services/media-selected/media-selected.service';
import { MediaModel } from './media-module/models/media.interface';
import { MediaPageComponent } from './media-module/components/media-page/media-page/media-page.component';
import { VideoPlayingComponent } from './video-playing-module/components/video-playing/video-playing.component';
import { PlayerSessionService } from './video-playing-module/services/player-session/player-session.service';

@Component({
  selector: 'app-main-appli',
  standalone: true,
  imports: [RouterOutlet, MenuBarComponent, MediaPageComponent, FooterComponent, VideoPlayingComponent],
  templateUrl: './main-appli.component.html',
  styleUrl: './main-appli.component.css'
})
export class MainAppliComponent {

  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;
  componentMustBeHidden !: boolean;
  isPlayerOpen: boolean = false;

  private subscription: Subscription = new Subscription();
  mediaSelected: MediaModel | undefined = undefined;

  constructor(private readonly router: Router,
    private readonly hiddenComponentService: HiddenComponentService,
    private readonly scrollEventService: ScrollEventService,
    private readonly renderer: Renderer2,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly playerSessionService: PlayerSessionService
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
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
    );

    this.subscription.add(
      this.playerSessionService.state$.subscribe((state) => {
        this.isPlayerOpen = state.mode !== 'closed';
      })
    );
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
