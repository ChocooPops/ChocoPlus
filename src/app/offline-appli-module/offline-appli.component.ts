import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuBarComponent } from './menu/menu-bar/menu-bar.component';
import { MediaSelectedService } from '../main-appli-module/media-module/services/media-selected/media-selected.service';
import { Subscription } from 'rxjs';
import { MediaModel } from '../main-appli-module/media-module/models/media.interface';
import { MediaPageComponent } from '../main-appli-module/media-module/components/media-page/media-page/media-page.component';

@Component({
  selector: 'app-offline-appli',
  standalone: true,
  imports: [RouterOutlet, MenuBarComponent, MediaPageComponent],
  templateUrl: './offline-appli.component.html',
  styleUrl: './offline-appli.component.css'
})
export class OfflineAppliComponent {

  mediaSelected: MediaModel | undefined = undefined;
  private subscription: Subscription = new Subscription();
  
  constructor(private readonly mediaSelectedService: MediaSelectedService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((media: MediaModel | undefined) => {
        this.mediaSelected = media;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
