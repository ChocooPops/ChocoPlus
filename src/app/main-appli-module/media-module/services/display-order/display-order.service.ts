import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DisplayOrderService {

  private initOrder: number = 10;
  private order: number = this.initOrder;
  private timerZoom: any;
  private timerEndZoom: any;
  private refreshment: number = 500;

  public getOrderDisplay(): number {
    this.order = this.order + 1;
    return this.order;
  }

  public resetOrder() {
    this.order = this.initOrder;
  }

  public getInitOrder() {
    return this.initOrder;
  }

  public startTimerZoom(callback: () => void): void {
    this.stopTimerZoom();
    this.timerZoom = setTimeout(() => {
      callback();
      this.stopTimerZoom();
    }, this.refreshment);
  }

  public stopTimerZoom(): void {
    if (this.timerZoom) {
      clearTimeout(this.timerZoom);
      this.timerZoom = null;
    }
  }

  public startTimerEndZoom(callback: () => void): void {
    this.timerEndZoom = setTimeout(() => {
      callback();
      this.stopTimerEndZoom();
    }, this.refreshment);
  }

  public stopTimerEndZoom(): void {
    if (this.timerEndZoom) {
      clearTimeout(this.timerEndZoom);
      this.timerEndZoom = null;
    }
  }

}
