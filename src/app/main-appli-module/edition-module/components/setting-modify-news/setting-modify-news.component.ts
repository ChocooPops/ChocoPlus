import { Component } from '@angular/core';
import { PopupComponent } from '../popup/popup.component';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { MediaModel } from '../../../media-module/models/media.interface';
import { NewsModel } from '../../../news-module/models/news.interface';
import { NewsService } from '../../../news-module/services/news/news.service';
import { Subscription, take } from 'rxjs';
import { NewsOverviewComponent } from '../news-overview/news-overview.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { UnauthorizedError } from '../abstract-components/unauthorized-error-abstract.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';
import { SimpleModel } from '../../../../common-module/models/simple-model';

@Component({
  selector: 'app-setting-modify-news',
  standalone: true,
  imports: [PopupComponent, InputResearchSeriesComponent, InputResearchMovieComponent, ButtonRemoveComponent, ButtonSaveComponent, NewsOverviewComponent],
  templateUrl: './setting-modify-news.component.html',
  styleUrls: ['./setting-modify-news.component.css', '../../../../common-module/styles/loader.css', '../../styles/edition.css']
})
export class SettingModifyNewsComponent extends UnauthorizedError {

  newsList: NewsModel[] | undefined = undefined;
  private subscription: Subscription = new Subscription();
  private messageDeleting: string = "Enregistrer les modifications ?";

  constructor(private newsService: NewsService) {
    super();
    this.newsService.setNewsEdit();
  }

  ngOnInit(): void {
    this.displayLoader = true;
    this.subscription.add(
      this.newsService.getEditNews().subscribe((data: NewsModel[]) => {
        this.newsList = data;
        this.displayLoader = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onAddMediaIntoNews(media: MediaModel): void {
    this.newsService.addMediaIntoNews(media);
  }

  onDeleteMediaIntoNews(id: number): void {
    this.newsService.deleteMediaIntoNews(id);
  }

  onModifyOrientationByNewsId(info: number[]): void {
    this.newsService.modifyOrientationByNewsId(info[0], info[1]);
  }

  onModifyBackgroundbyId(info: SimpleModel): void {
    this.newsService.modifySrcBackgroundById(info.id, info.name);
  }

  onMoveNewsToTop(id: number): void {
    this.newsService.moveNewsToTop(id);
  }

  onMoveNewsTopBottom(id: number): void {
    this.newsService.moveNewsToBottom(id);
  }

  resetEditNews(): void {
    this.newsService.setNewsEdit();
  }

  saveNews(): void {
    this.popup.setDisplayButton(true);
    this.popup.setMessage(this.messageDeleting, undefined);
    this.popup.setDisplayPopup(true);
  }

  onFetchModifyNews(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.newsService.fetchModifyNews().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }

}
