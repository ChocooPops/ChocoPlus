import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NewsModel } from '../../models/news.interface';
import { BehaviorSubject, catchError, map, Observable, of, take } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { MediaModel } from '../../../media-module/models/media.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { NewsWritedModel } from '../../models/news-writed.interface';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { SeriesService } from '../../../media-module/services/series/series.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private apiUrlNews: string = `${environment.apiNews}`;
  private news: NewsModel[] = [];

  private newsEditSubject: BehaviorSubject<NewsModel[]> = new BehaviorSubject<NewsModel[]>([]);
  private newsEdit$: Observable<NewsModel[]> = this.newsEditSubject.asObservable();

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) { }

  private getId(): number {
    const edit: NewsModel[] = this.newsEditSubject.value;
    return (edit.length > 0 ? Math.max(...edit.map(item => item.id)) : 0) + 1;
  }

  public fetchGetAllNews(): Observable<NewsModel[]> {
    if (this.news.length <= 0) {
      return this.http.get<any>(`${this.apiUrlNews}`).pipe(
        map((data: NewsModel[]) => {
          const news: NewsModel[] = [];
          data.forEach((item: NewsModel) => {
            if (item.media.mediaType === MediaTypeModel.MOVIE) {
              news.push({
                id: item.id,
                srcBackground: item.srcBackground || undefined,
                orientation: item.orientation || 3,
                media: this.movieService.createNewMovie(item.media)
              });
            } else if (item.media.mediaType === MediaTypeModel.SERIES) {
              news.push({
                id: item.id,
                srcBackground: item.srcBackground || undefined,
                orientation: item.orientation || 3,
                media: this.seriesService.createNewSeries(item.media)
              });
            }
          });
          return this.news = news;
        }),
        catchError(() => {
          return of([]);
        })
      )
    } else {
      return of(this.news);
    }
  }

  public fetchModifyNews(): Observable<MessageReturnedModel> {
    const news: NewsModel[] = this.newsEditSubject.value;
    const updatedNews: NewsWritedModel[] = [];
    news.forEach((item: NewsModel) => {
      updatedNews.push({
        id: item.id,
        srcBackground: item.srcBackground || undefined,
        orientation: item.orientation,
        mediaId: item.media.id
      })
    });
    return this.http.put<any>(`${this.apiUrlNews}`, updatedNews).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.news = [];
          this.setNewsEdit();
        }
        return data;
      })
    )
  }

  public getEditNews(): Observable<NewsModel[]> {
    return this.newsEdit$;
  }

  public setNewsEdit(): void {
    this.fetchGetAllNews().pipe(take(1)).subscribe((data: NewsModel[]) => {
      this.newsEditSubject.next(data);
    });
  }

  public addMediaIntoNews(media: MediaModel): void {
    const news: NewsModel[] = this.newsEditSubject.value;
    const exists = news.some(item => item.media.id === media.id && item.media.mediaType === media.mediaType);

    if (!exists) {
      news.push({
        id: this.getId(),
        srcBackground: media.srcBackgroundImage,
        orientation: 3,
        media: media
      });
      this.newsEditSubject.next([...news]);
    }
  }

  public deleteMediaIntoNews(id: number): void {
    const news: NewsModel[] = this.newsEditSubject.value.filter((item: NewsModel) => item.id !== id);
    this.newsEditSubject.next(news);
  }

  public modifyOrientationByNewsId(id: number, orientation: number): void {
    const news: NewsModel[] = this.newsEditSubject.value;
    news.forEach((item: NewsModel) => {
      if (item.id === id) {
        item.orientation = orientation;
      }
    });

    this.newsEditSubject.next(news);
  }

  public modifySrcBackgroundById(id: number, srcBackground: string): void {
    const news: NewsModel[] = this.newsEditSubject.value;
    news.forEach((item: NewsModel) => {
      if (item.id === id) {
        item.srcBackground = srcBackground;
      }
    });
    this.newsEditSubject.next(news);
  }

  public moveNewsToTop(id: number): void {
    const newsList: NewsModel[] = this.newsEditSubject.value;
    const index = newsList.findIndex(license => license.id === id);
    if (index !== -1) {
      const newIndex = Math.min(index + 1, newsList.length - 1);
      const updated = [...newsList];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      this.newsEditSubject.next(updated);
    }
  }

  public moveNewsToBottom(id: number): void {
    const newsList: NewsModel[] = this.newsEditSubject.value;
    const index = newsList.findIndex(news => news.id === id);
    if (index !== -1) {
      const newIndex = Math.max(index - 1, 0);
      const updated = [...newsList];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      this.newsEditSubject.next(updated);
    }
  }

  public changeMyList(mediaId: number, state: boolean): void {
    this.news.forEach((item: NewsModel) => {
      if (item.media.id === mediaId) {
        item.media.isInList = state;
        return;
      }
    });
  }

}
