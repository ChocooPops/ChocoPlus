import { Component } from '@angular/core';
import { ElectronService } from '../../services/electron/electron.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './title-bar.component.html',
  styleUrl: './title-bar.component.css'
})
export class TitleBarComponent {

  srcReduce: string = 'icon/reduce.svg';
  srcShrink: string = 'icon/shrink.svg';
  srcEnlarge: string = 'icon/enlarge.svg';
  srcClose: string = 'icon/close.svg';
  isMaximize !: boolean;
  subscription: Subscription = new Subscription();

  constructor(private electronService: ElectronService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.electronService.getIsMaximize().subscribe((state: boolean) => {
        this.isMaximize = state;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async onClickMinimize(): Promise<void> {
    await this.electronService.windowMinimize();
  }

  async onClickMaximize(): Promise<void> {
    this.isMaximize = await this.electronService.windowMaximize();
  }

  async onClickClose(): Promise<void> {
    await this.electronService.windowClose();
  }

}
