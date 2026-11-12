import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Decides which media of the app may be heard: one at a time.
// The players (internal player, ChocoPlayer) take the focus when they start, a trailer when the user starts it.
// The other media pause while the focus belongs to someone else and go on when it comes back to them or is free:
// trailers of the movie / series pages, the game music.
// Owners are stacked: releasing the focus gives it back to the previous owner still there.
@Injectable({
  providedIn: 'root'
})
export class MediaFocusService {

  private owners: symbol[] = [];
  private readonly ownerSubject = new BehaviorSubject<symbol | null>(null);
  public readonly owner$: Observable<symbol | null> = this.ownerSubject.asObservable();

  constructor(private readonly zone: NgZone) { }

  public get owner(): symbol | null {
    return this.ownerSubject.value;
  }

  // True when the media may play: nobody has the focus, or it is this media's
  public isFreeFor(owner: symbol): boolean {
    const current = this.ownerSubject.value;
    return current === null || current === owner;
  }

  public claim(owner: symbol): void {
    this.owners = [...this.owners.filter((other) => other !== owner), owner];
    this.publish();
  }

  public release(owner: symbol): void {
    if (!this.owners.includes(owner)) return;
    this.owners = this.owners.filter((other) => other !== owner);
    this.publish();
  }

  // Claims may come from outside Angular (Electron events): listeners update their view in the zone
  private publish(): void {
    const owner = this.owners.length > 0 ? this.owners[this.owners.length - 1] : null;
    if (owner === this.ownerSubject.value) return;
    this.zone.run(() => this.ownerSubject.next(owner));
  }

}
