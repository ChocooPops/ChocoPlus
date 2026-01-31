import { Injectable } from '@angular/core';
import { SelectionModel } from '../../../main-appli-module/media-module/models/selection.interface';
import { LicenseModel } from '../../../main-appli-module/license-module/model/license.interface';
import { MediaModel } from '../../../main-appli-module/media-module/models/media.interface';
import { FormatPosterModel } from '../../../main-appli-module/common-module/models/format-poster.enum';
import { SelectionType } from '../../../main-appli-module/media-module/models/selection-type.enum';
import { CompressedPosterService } from '../../../main-appli-module/common-module/services/compressed-poster/compressed-poster.service';
import { NewsModel } from '../../../main-appli-module/news-module/models/news.interface';
import { SeasonModel } from '../../../main-appli-module/media-module/models/series/season.interface';
import { EpisodeModel } from '../../../main-appli-module/media-module/models/series/episode.interface';
import { NewsVideoRunningModel } from '../../../main-appli-module/news-module/models/news-video-running.interface';

@Injectable({
  providedIn: 'root'
})
export class ImagePreloaderService {

  private preloadedImageUrls = new Set<string>();
  private controllers = new Map<string, AbortController>();

  constructor(private compressedPosterService: CompressedPosterService) { }

  async preloadImages(imageUrls: string[], signal?: AbortSignal): Promise<void> {
    const newUrls = imageUrls.filter(url => !this.preloadedImageUrls.has(url));
    const uniqueUrls = [...new Set(newUrls)];

    const promises = uniqueUrls.map(url => {

      return new Promise<void>((resolve, reject) => {

        if (signal?.aborted) {
          return reject("Cancelled");
        }

        const controller = new AbortController();
        this.controllers.set(url, controller);

        const img = new Image();

        // Annulation : si on abort → on arrête le chargement
        signal?.addEventListener("abort", () => {
          img.src = "";
          controller.abort();
          reject("Cancelled");
        });

        img.onload = () => {
          this.preloadedImageUrls.add(url);
          this.controllers.delete(url);
          resolve();
        };

        img.onerror = () => {
          this.controllers.delete(url);
          reject(`Failed to load image: ${url}`);
        };

        img.src = url;

        if (img.complete && img.naturalWidth !== 0) {
          this.preloadedImageUrls.add(url);
          resolve();
        }
      });
    });

    return Promise.allSettled(promises).then(() => { });
  }

  public getPosterFromMediaListToLoad(medias: MediaModel[], format: FormatPosterModel): string[] {
    const img: string[] = [];
    medias.forEach((media: MediaModel) => {
      if (format === FormatPosterModel.HORIZONTAL) {
        const poster: string | undefined = this.compressedPosterService.getPosterMedia(SelectionType.HORIZONTAL_POSTER, media);
        const logo: string | undefined = this.compressedPosterService.getLogoForMedia(media);
        if (poster) {
          img.push(poster);
        }
        if (logo) {
          img.push(logo);
        }
      } else if (format === FormatPosterModel.VERTICAL) {
        const poster: string | undefined = this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, media);
        if (poster) {
          img.push(poster);
        }
      }
    })
    return img;
  }

  public getImageFromMediaShowedToLoad(media: MediaModel): string[] {
    const img: string[] = [];
    const logo: string | undefined = this.compressedPosterService.getLogoForMediaPresentationTopHead(media);
    const background: string | undefined = this.compressedPosterService.getBackgroundForMediaPresentationTopHead(media);

    if (logo) {
      img.push(logo);
    }
    if (background) {
      img.push(background);
    }

    return img;
  }

  public getImageFromNewsList(news: NewsModel[]): string[] {
    const img: string[] = [];
    news.forEach((item: NewsModel) => {
      const logo: string | undefined = this.compressedPosterService.getLogoForMediaPresentationTopHead(item.media);
      const background: string | undefined = this.compressedPosterService.getBackgroundForNewsToHome(item);

      if (logo) {
        img.push(logo);
      }
      if (background) {
        img.push(background);
      }
    });
    return img;
  }

  public getImageFormNewsVideoRunning(news: NewsVideoRunningModel): string[] {
    const img: string[] = [];
    const logo: string | undefined = this.compressedPosterService.getLogoForMediaPresentationTopHead(news.media);
    const background: string | undefined = this.compressedPosterService.getBackgroundForNewsVideoRunning(news);
    if (logo) {
      img.push(logo);
    }
    if (background) {
      img.push(background);
    }
    return img;
  }

  public getPosterFromSelectionToLoad(selections: SelectionModel[], format: FormatPosterModel): string[] {
    const img: string[] = [];
    selections.forEach((selection: SelectionModel) => {
      selection.mediaList.forEach(media => {
        if (format === FormatPosterModel.HORIZONTAL) {
          const poster: string | undefined = this.compressedPosterService.getPosterMedia(SelectionType.HORIZONTAL_POSTER, media);
          const logo: string | undefined = this.compressedPosterService.getLogoForMedia(media);
          if (poster) {
            img.push(poster);
          }
          if (logo) {
            img.push(logo);
          }
        } else {
          const poster: string | undefined = this.compressedPosterService.getPosterMedia(selection.typeSelection, media);
          if (poster) {
            img.push(poster);
          }
        }
      });
    })
    return img;
  }

  public getPosterFromLicenseToLoad(license: LicenseModel, format: FormatPosterModel): string[] {
    const img: string[] = this.getPosterFromSelectionToLoad(license.selectionList || [], format);
    const logo: string | undefined = this.compressedPosterService.getLogoForLicense(license);
    const background: string | undefined = this.compressedPosterService.getBackgroundForLicense(license);
    if (logo) {
      img.push(logo);
    }
    if (background) {
      img.push(background);
    }
    return img;
  }

  public getPosterFromSeasons(seasons: SeasonModel[]): string[] {
    const img: string[] = [];
    seasons.forEach((season: SeasonModel) => {
      const poster: string | undefined = this.compressedPosterService.getSeasonPoster(season);
      if (poster) {
        img.push(poster);
      }
    });
    return img;
  }

  public getPosterFromEpisodes(episodes: EpisodeModel[]): string[] {
    const img: string[] = [];
    episodes.forEach((episode: EpisodeModel) => {
      const poster: string | undefined = this.compressedPosterService.getEpisodePoster(episode);
      if (poster) {
        img.push(poster);
      }
    });
    return img;
  }

  public async preloadControllersStreamVideo(): Promise<void> {
    const foler: string = 'icon/controls';
    const img: string[] = [
      `${foler}/back-arrow.svg`,
      `${foler}/backtrackingSpeed.svg`,
      `${foler}/fast-backtracking.svg`,
      `${foler}/fast-forward.svg`,
      `${foler}/forwardSpeed.svg`,
      `${foler}/fullscreen.svg`,
      `${foler}/keySound0.svg`,
      `${foler}/keySound1.svg`,
      `${foler}/keySound2.svg`,
      `${foler}/keySound3.svg`,
      `${foler}/mute.svg`,
      `${foler}/notfullscreen.svg`,
      `${foler}/play.svg`,
      `${foler}/sound.svg`,
      `${foler}/speed.svg`,
      `${foler}/stop.svg`,
      `${foler}/subtitle.svg`,
      `${foler}/quality.svg`,
      `${foler}/series.svg`
    ]
    this.preloadImages(img).finally(() => {
      return true;
    })
  }

  public getAllIconsFromLicense(licenses: LicenseModel[]): string[] {
    const img: string[] = [];
    licenses.forEach((license: LicenseModel) => {
      const icon: string | undefined = this.compressedPosterService.getIconForLicense(license);
      if (icon) {
        img.push(icon);
      }
    })
    return img;
  }

}
