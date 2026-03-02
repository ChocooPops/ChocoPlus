import { Component } from '@angular/core';
import { SavePathService } from '../../../common-module/services/save-path/save-path.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation-button',
  standalone: true,
  imports: [],
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

  constructor(private readonly navigation: SavePathService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.navigation.getCanGoBack().subscribe((bool: boolean) => {
        this.canGoBack = bool;
      })
    );
    this.subscription.add(
      this.navigation.getCanGoForward().subscribe((bool: boolean) => {
        this.canGoForward = bool;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public goBack() {
    this.navigation.back();
  }

  public goForward() {
    this.navigation.forward();
  } 

}
