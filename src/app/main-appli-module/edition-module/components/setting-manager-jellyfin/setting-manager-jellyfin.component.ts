import { Component } from '@angular/core';
import { PopupComponent } from '../popup/popup.component';
import { UnauthorizedError } from '../abstract-components/unauthorized-error-abstract.directive';
import { ManagerJellyfinService } from '../../services/manager-jellyfin/manager-jellyfin.service';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-setting-manager-jellyfin',
  standalone: true,
  imports: [PopupComponent, NgxJsonViewerModule],
  templateUrl: './setting-manager-jellyfin.component.html',
  styleUrls: ['./setting-manager-jellyfin.component.css', '../../styles/edition.css']
})
export class SettingManagerJellyfinComponent extends UnauthorizedError {

  private type!: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  private message: string = 'Voulez-vous vraiment exécuter cet appel ?';
  public object: any | undefined = undefined;

  constructor(private managerJellyfinService: ManagerJellyfinService) {
    super();
  }

  public emitActionData(): void {
    this.onFetching();
    if (this.type === 1) {
      this.fetchResetJallyfinItemsMovie();
    } else if (this.type === 2) {
      this.fetchResetJallyfinItemsSeries();
    } else if (this.type === 3) {
      this.fetchResetAllMovieData();
    } else if (this.type === 4) {
      this.fetchResetAllSeriesData();
    } else if (this.type === 5) {
      this.fetchSaveMovieDontSaved();
    } else if (this.type === 6) {
      this.fetchSaveSeriesDontSaved();
    } else if (this.type === 7) {
      this.fetchResetAllSimilarTitles();
    } else if (this.type === 8) {
      this.fetchReloadAllProfilPhot();
    }
  }

  onClickButton(type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): void {
    this.type = type;
    this.popup.setDisplayButton(true);
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
  }

  private onFetching(): void {
    this.object = undefined;
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
  }

  private endTask(data: any): void {
    this.object = data;
    this.popup.setDisplayPopup(false);
  }

  private fetchResetJallyfinItemsMovie(): void {
    this.managerJellyfinService.fetchResetJallyfinItemsMovie().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchResetJallyfinItemsSeries(): void {
    this.managerJellyfinService.fetchResetJallyfinItemsSeries().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchResetAllMovieData(): void {
    this.managerJellyfinService.fetchResetAllMovieData().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchResetAllSeriesData(): void {
    this.managerJellyfinService.fetchResetAllSeriesData().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchSaveMovieDontSaved(): void {
    this.managerJellyfinService.fetchSaveMovieDontSaved().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchSaveSeriesDontSaved(): void {
    this.managerJellyfinService.fetchSaveSeriesDontSaved().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchResetAllSimilarTitles(): void {
    this.managerJellyfinService.fetchResetAllSimilarTitles().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchReloadAllProfilPhot(): void {
    this.managerJellyfinService.fetchReloadAllProfilPhot().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    })
  }

}
