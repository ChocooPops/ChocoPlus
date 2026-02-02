import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuTabModel } from '../../model/menu-tab.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuTabService {

  private rootImage: string = 'icon';

  private menuTabs: MenuTabModel[] = [
    {
      id: 1,
      name: "Accueil",
      route: "home",
      srcImage: `${this.rootImage}/home.svg`,
      isClicked: false
    },
    {
      id: 2,
      name: "Rechercher",
      route: "search",
      srcImage: `${this.rootImage}/research.svg`,
      isClicked: false
    },
    {
      id: 3,
      name: "Film",
      route: "movies",
      srcImage: `${this.rootImage}/movie.svg`,
      isClicked: false
    },
    {
      id: 4,
      name: "Série",
      route: "series",
      srcImage: `${this.rootImage}/serie.svg`,
      isClicked: false
    },
    {
      id: 5,
      name: "Ma liste",
      route: "my-list",
      srcImage: `${this.rootImage}/mylist.svg`,
      isClicked: false
    },
    {
      id: 6,
      name: "Editer",
      route: "edition",
      srcImage: `${this.rootImage}/edition.svg`,
      isClicked: false
    }
  ];

  private plusTab: MenuTabModel = {
    id: 10,
    name: "Plus",
    route: "",
    srcImage: "icon/arrow-2.svg",
    isClicked: false
  }

  private activateTransitionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private activateTransition$: Observable<boolean> = this.activateTransitionSubject.asObservable();

  private activateTransitionFromMediaPageSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private activateTransitionFromMediaPage$: Observable<boolean> = this.activateTransitionFromMediaPageSubject.asObservable();

  public getAllMenuTab(): MenuTabModel[] {
    return this.menuTabs;
  }

  public getActivateTransition(): Observable<boolean> {
    return this.activateTransition$;
  }

  public getActivateTransitionFromMediaPage(): Observable<boolean> {
    return this.activateTransitionFromMediaPage$;
  }

  public setActivateTransition(state: boolean): void {
    if (state !== this.activateTransitionSubject.value) {
      this.activateTransitionSubject.next(state);
    }
  }

  public setActivateTransitionFromMediaPage(state: boolean): void {
    if (state !== this.activateTransitionFromMediaPageSubject.value) {
      this.activateTransitionFromMediaPageSubject.next(state);
    }
  }

  public setActivateTransitionValue(): boolean {
    return this.activateTransitionSubject.value;
  }

  public getMenuTab(): MenuTabModel {
    return this.plusTab;
  }

  public getLastElements(count: number): MenuTabModel[] {
    if (count <= 0) return [];
    return this.menuTabs.slice(-count);
  }

  public getTabsNotInPlus(tabs: MenuTabModel[]): MenuTabModel[] {
    return this.menuTabs.filter(item =>
      !tabs.some(item2 => item2.id === item.id)
    );
  }

}
