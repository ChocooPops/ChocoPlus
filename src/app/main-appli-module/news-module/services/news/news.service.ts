import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NewsModel } from '../../models/news.interface';
import { BehaviorSubject, catchError, map, Observable, of, take } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { MediaModel } from '../../../media-module/models/media.interface';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { NewsWritedModel } from '../../models/news-writed.interface';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { SimpleModel } from '../../../../common-module/models/simple-model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  public getInitialDisplayType(): SimpleModel[] {
    return [
      {
        id: 1,
        name: 'EDITION.BY_ORDER',
        value: false,
        state: true
      },
      {
        id: 2,
        name: 'EDITION.BY_RANDOM',
        value: true,
        state: false
      }
    ]
  }

  private apiUrlNews: string = `${environment.apiNews}`;
  private news: NewsModel[] = [];

  private newsEditSubject: BehaviorSubject<NewsModel[]> = new BehaviorSubject<NewsModel[]>([]);
  private newsEdit$: Observable<NewsModel[]> = this.newsEditSubject.asObservable();

  private radioButtonDisplayTypeSubject: BehaviorSubject<SimpleModel[]> = new BehaviorSubject<SimpleModel[]>(this.getInitialDisplayType())
  private radioButtonDisplayType$: Observable<SimpleModel[]> = this.radioButtonDisplayTypeSubject.asObservable();

  constructor(private readonly http: HttpClient,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService
  ) { }

  private getId(): number {
    const edit: NewsModel[] = this.newsEditSubject.value;
    return (edit.length > 0 ? Math.max(...edit.map(item => item.id)) : 0) + 1;
  }

  public getRadioButtonDisplayType(): Observable<SimpleModel[]> {
    return this.radioButtonDisplayType$;
  }

  private createTabAllNews(data: any[]): NewsModel[] {
    const news: NewsModel[] = [];
    data.forEach((item: NewsModel) => {
      if (item.media.mediaType === MediaTypeModel.MOVIE) {
        news.push({
          id: item.id,
          srcBackground: item.srcBackground || undefined,
          orientation: item.orientation || 3,
          isOrderRandom: item.isOrderRandom ? true : false,
          media: this.movieService.createNewMovie(item.media)
        });
      } else if (item.media.mediaType === MediaTypeModel.SERIES) {
        news.push({
          id: item.id,
          srcBackground: item.srcBackground || undefined,
          orientation: item.orientation || 3,
          isOrderRandom: item.isOrderRandom ? true : false,
          media: this.seriesService.createNewSeries(item.media)
        });
      }
    });
    return news;
  }

  public fetchAllNewsByOrder(): Observable<NewsModel[]> {
    const params = new HttpParams().set('setOrder', 1)
    return this.http.get<any>(`${this.apiUrlNews}`, { params }).pipe(
        map((data: NewsModel[]) => {
          const news: NewsModel[] = this.createTabAllNews(data);
          if (news && news.length > 0 && news[0].isOrderRandom) {
            this.modifyOrderType(2);
          } else {
            this.modifyOrderType(1);
          }
          return news;
        }),
        catchError(() => {
          return of([]);
        })
      )
  }

  public fetchGetAllNews(): Observable<NewsModel[]> {
    if (this.news.length <= 0) {
      return this.http.get<any>(`${this.apiUrlNews}`).pipe(
        map((data: NewsModel[]) => {
          return this.news = this.createTabAllNews(data);
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
    const isOrderRandom: boolean = this.radioButtonDisplayTypeSubject.value.find((item) => item.state)?.value ?? false;
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
    return this.http.put<any>(`${this.apiUrlNews}`, { updatedNews, isOrderRandom }).pipe(
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
    this.fetchAllNewsByOrder().pipe(take(1)).subscribe((data: NewsModel[]) => {
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
        isOrderRandom: false,
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

  public moveNewsToBottom(id: number): void {
    const newsList: NewsModel[] = this.newsEditSubject.value;
    const index = newsList.findIndex(news => news.id === id);

    if (index !== -1) {
      const newIndex = index === 0
        ? newsList.length - 1
        : index - 1;

      const updated = [...newsList];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);

      this.newsEditSubject.next(updated);
    }
  }

  public moveNewsToTop(id: number): void {
    const newsList: NewsModel[] = this.newsEditSubject.value;
    const index = newsList.findIndex(news => news.id === id);

    if (index !== -1) {
      const newIndex = index === newsList.length - 1
        ? 0
        : index + 1;

      const updated = [...newsList];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);

      this.newsEditSubject.next(updated);
    }
  }

  public modifyOrderType(id: number): void {
    const updatedButtons: SimpleModel[] = this.radioButtonDisplayTypeSubject.getValue().map(radio => ({
      ...radio,
      state: radio.id === id,
    }));
    this.radioButtonDisplayTypeSubject.next(updatedButtons);
  }

  public resetEditNews(): void {
    this.newsEditSubject.next([]);
    this.radioButtonDisplayTypeSubject.next(this.getInitialDisplayType());
  }

}
