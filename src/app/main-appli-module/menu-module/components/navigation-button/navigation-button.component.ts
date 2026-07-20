import { Component } from '@angular/core';
import { SavePathService } from '../../../common-module/services/save-path/save-path.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { combineLatest, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-navigation-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './navigation-button.component.html',
  styleUrl: './navigation-button.component.css'
})
export class NavigationButtonComponent {

  public arrowLeft: string = 'icon/arrow-left.svg';
  public arrowRight: string = 'icon/arrow-right.svg';
  public arrowLeftDisable: string = 'icon/arrow-left-disable.svg';
  public arrowRightDisable: string = 'icon/arrow-right-disable.svg';
  private subscription: Subscription = new Subscription();

  public canGoBack!: boolean;
  public canGoForward!: boolean;

  constructor(private readonly navigation: SavePathService,
    private readonly mediaSelectedService: MediaSelectedService) { }

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.navigation.getCanGoBack(),
        this.mediaSelectedService.getCanGoBack()
      ]).subscribe(([routeCanGoBack, mediaCanGoBack]: [boolean, boolean]) => {
        this.canGoBack = routeCanGoBack || mediaCanGoBack;
      })
    );
    this.subscription.add(
      combineLatest([
        this.navigation.getCanGoForward(),
        this.mediaSelectedService.getCanGoForward()
      ]).subscribe(([routeCanGoForward, mediaCanGoForward]: [boolean, boolean]) => {
        this.canGoForward = routeCanGoForward || mediaCanGoForward;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public goBack() {
    if (this.mediaSelectedService.canGoBack()) {
      this.mediaSelectedService.back();
    } else {
      this.navigation.back();
    }
  }

  public goForward() {
    if (this.mediaSelectedService.canGoForward()) {
      this.mediaSelectedService.forward();
    } else {
      this.navigation.forward();
    }
  }

}
