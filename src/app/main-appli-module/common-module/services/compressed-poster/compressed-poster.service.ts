import { Injectable } from '@angular/core';
import { ScalePoster } from '../../models/scale-poster.enum';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { MediaModel } from '../../../media-module/models/media.interface';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { SeasonModel } from '../../../media-module/models/series/season.interface';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { NewsModel } from '../../../news-module/models/news.interface';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';

@Injectable({
  providedIn: 'root'
})
export class CompressedPosterService {

  private readonly compressedVerticalPoster: string = 'COMPRESSED_VERTICAL_POSTER';
  private readonly compressedHorizontalPoster: string = 'COMPRESSED_HORIZONTAL_POSTER';
  private readonly compressedSpecialLicensePoster: string = 'COMPRESSED_SPECIAL_LICENSE_POSTER';
  private readonly compressedLogoIntoPoster: string = 'COMPRESSED_LOGO_INTO_POSTER';

  private readonly compressedBackgroundPresentationToHead: string = 'COMPRESSED_BACKGROUND_PRESENTATION_TO_HEAD';
  private readonly compressedLogoPresentationToHead: string = 'COMPRESSED_LOGO_PRESENTATION_TO_HEAD';

  private readonly compressedBackgroundPresentation: string = 'COMPRESSED_BACKGROUND_PRESENTATION';
  private readonly compressedLogoPresentation: string = 'COMPRESSED_LOGO_PRESENTATION';

  private readonly compressedIconLicense: string = 'COMPESSED_ICON_LICENSE';
  private readonly compressedLogoLicense: string = 'COMPRESSED_LOGO_LICENSE';
  private readonly compressedBackgroundLicense: string = 'COMPRESSED_BACKGROUND_LICENSE';

  private readonly compressedSeasonPoster: string = 'COMPRESSED_SEASON_POSTER';
  private readonly compressedEpisodePoster: string = 'COMPRESSED_EPISODE_POSTER'

  private currentScaleNormalVerticalPoster: ScalePoster = this.initCompressedPoster(this.compressedVerticalPoster, ScalePoster.SCALE_300h);
  private currentScaleHorizontalPoster: ScalePoster = this.initCompressedPoster(this.compressedHorizontalPoster, ScalePoster.SCALE_300w);
  private currentScaleSpecialAndLicensePoster: ScalePoster = this.initCompressedPoster(this.compressedSpecialLicensePoster, ScalePoster.SCALE_600h);
  private currentScaleLogoIntoPoster: ScalePoster = this.initCompressedPoster(this.compressedLogoIntoPoster, ScalePoster.SCALE_500w);

  private currentScaleBackgroundPresentationTopHead: ScalePoster = this.initCompressedPoster(this.compressedBackgroundPresentationToHead, ScalePoster.SCALE_ORIGINAL);
  private currentScaleLogoPresentationTopHead: ScalePoster = this.initCompressedPoster(this.compressedLogoPresentationToHead, ScalePoster.SCALE_ORIGINAL);

  private currentScaleBackgroundPresentation: ScalePoster = this.initCompressedPoster(this.compressedBackgroundPresentation, ScalePoster.SCALE_1920w);
  private currentScaleLogoPresentation: ScalePoster = this.initCompressedPoster(this.compressedLogoPresentation, ScalePoster.SCALE_700w);

  private currentScaleIconLicense: ScalePoster = this.initCompressedPoster(this.compressedIconLicense, ScalePoster.SCALE_600w);
  private currentScaleLogoLicense: ScalePoster = this.initCompressedPoster(this.compressedLogoLicense, ScalePoster.SCALE_ORIGINAL);
  private currentScaleBackgroundLicense: ScalePoster = this.initCompressedPoster(this.compressedBackgroundLicense, ScalePoster.SCALE_ORIGINAL);

  private currentScaleSeasonPoster: ScalePoster = this.initCompressedPoster(this.compressedSeasonPoster, ScalePoster.SCALE_300h);
  private currentScaleEpisodePoster: ScalePoster = this.initCompressedPoster(this.compressedEpisodePoster, ScalePoster.SCALE_300w);

  private initCompressedPoster(compressedName: string, scale: ScalePoster): ScalePoster {
    const item = localStorage.getItem(compressedName) as ScalePoster;
    if (item && Object.values(ScalePoster).includes(item)) {
      return item;
    } else {
      localStorage.setItem(compressedName, scale);
      return scale;
    }
  }

  public insertIntoUrlBeforeFilename(url: string, insert: ScalePoster): string {
    if (insert !== ScalePoster.SCALE_ORIGINAL) {
      const urlParts = url.split('/');

      if (urlParts.length < 2) return url;

      const fileName = urlParts.pop();
      urlParts.push(insert);
      urlParts.push(fileName!);

      return urlParts.join('/');
    } else {
      return url;
    }
  }

  public getPosterMedia(type: SelectionType, media: MediaModel, scale: ScalePoster | undefined = undefined): string | undefined {
    let src: string | undefined = undefined;
    let currentScale !: ScalePoster;
    if (type === SelectionType.NORMAL_POSTER) {
      if (media.srcPosterNormal !== undefined) {
        src = media.srcPosterNormal[0];
      } else if (media.srcPosterSpecial !== undefined) {
        src = media.srcPosterSpecial[0];
      } else if (media.srcPosterLicense !== undefined) {
        src = media.srcPosterLicense[0];
      }
      currentScale = this.currentScaleNormalVerticalPoster;
    } else if (type === SelectionType.SPECIAL_POSTER) {
      if (media.srcPosterSpecial !== undefined) {
        src = media.srcPosterSpecial[0];
      } else if (media.srcPosterNormal !== undefined) {
        src = media.srcPosterNormal[0];
      } else if (media.srcPosterLicense !== undefined) {
        src = media.srcPosterLicense[0];
      }
      currentScale = this.currentScaleSpecialAndLicensePoster;
    } else if (type === SelectionType.LICENSE_POSTER) {
      if (media.srcPosterLicense !== undefined) {
        src = media.srcPosterLicense[0];
      } else if (media.srcPosterSpecial != undefined) {
        src = media.srcPosterSpecial[0];
      } else if (media.srcPosterNormal != undefined) {
        src = media.srcPosterNormal[0];
      }
      currentScale = this.currentScaleSpecialAndLicensePoster;
    } else if (type === SelectionType.HORIZONTAL_POSTER) {
      if (media.srcPosterHorizontal !== undefined) {
        src = media.srcPosterHorizontal[0];
      } else if (media.srcBackgroundImage !== undefined) {
        src = media.srcBackgroundImage;
      } else {
        src = undefined;
      }
      currentScale = this.currentScaleHorizontalPoster;
    }
    if (src) {
      if (scale) {
        src = this.insertIntoUrlBeforeFilename(src, scale);
      } else {
        src = this.insertIntoUrlBeforeFilename(src, currentScale);
      }
    }
    return src;
  }

  public getLogoForMedia(media: MediaModel, scale: ScalePoster | undefined = undefined): string | undefined {
    let src: string | undefined = undefined;
    if (media.srcLogo) {
      src = media.srcLogo;
      if (scale) {
        if (scale !== ScalePoster.SCALE_ORIGINAL) {
          src = this.insertIntoUrlBeforeFilename(src, scale);
        }
      } else {
        src = this.insertIntoUrlBeforeFilename(src, this.currentScaleLogoIntoPoster);
      }
    }
    return src;
  }

  public getBackgroundForMediaPresentationTopHead(media: MediaModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (media.srcBackgroundImage) {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(media.srcBackgroundImage, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(media.srcBackgroundImage, this.currentScaleBackgroundPresentationTopHead);
      }
    } else {
      return undefined;
    }
  }
  public getLogoForMediaPresentationTopHead(media: MediaModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (media.srcLogo) {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(media.srcLogo, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(media.srcLogo, this.currentScaleLogoPresentationTopHead);
      }
    } else {
      return undefined;
    }
  }

  public getBackgroundForMediaPresentation(media: MediaModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (media.srcBackgroundImage) {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(media.srcBackgroundImage, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(media.srcBackgroundImage, this.currentScaleBackgroundPresentation);
      }
    } else {
      return undefined;
    }
  }
  public getLogoForMediaPresentation(media: MediaModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (media.srcLogo) {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(media.srcLogo, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(media.srcLogo, this.currentScaleLogoPresentation);
      }
    } else {
      return undefined;
    }
  }

  public getBackgroundForNewsToHome(news: NewsModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (news.srcBackground) {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(news.srcBackground, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(news.srcBackground, this.currentScaleBackgroundPresentationTopHead);
      }
    } else {
      return undefined;
    }
  }

  public getBackgroundForNewsVideoRunning(videoRunning: NewsVideoRunningModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (videoRunning.srcBackground) {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(videoRunning.srcBackground, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(videoRunning.srcBackground, this.currentScaleBackgroundPresentationTopHead);
      }
    } else {
      return undefined;
    }
  }

  public getIconForLicense(license: LicenseModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (license.srcIcon && typeof license.srcIcon === 'string') {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(license.srcIcon, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(license.srcIcon, this.currentScaleIconLicense);
      }
    } else {
      return undefined;
    }
  }

  public getLogoForLicense(license: LicenseModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (license.srcLogo && typeof license.srcLogo === 'string') {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(license.srcLogo, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(license.srcLogo, this.currentScaleLogoLicense);
      }
    } else {
      return undefined;
    }
  }

  public getBackgroundForLicense(license: LicenseModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (license.srcBackground && typeof license.srcBackground === 'string') {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(license.srcBackground, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(license.srcBackground, this.currentScaleBackgroundLicense);
      }
    } else {
      return undefined;
    }
  }

  public getSeasonPoster(season: SeasonModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (season.srcPoster && typeof season.srcPoster === 'string') {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(season.srcPoster, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(season.srcPoster, this.currentScaleSeasonPoster);
      }
    } else {
      return undefined;
    }
  }

  public getEpisodePoster(episode: EpisodeModel, scale: ScalePoster | undefined = undefined): string | undefined {
    if (episode.srcPoster && typeof episode.srcPoster === 'string') {
      if (scale) {
        return this.insertIntoUrlBeforeFilename(episode.srcPoster, scale);
      } else {
        return this.insertIntoUrlBeforeFilename(episode.srcPoster, this.currentScaleEpisodePoster);
      }
    } else {
      return undefined;
    }
  }

  public getCompressedVerticalPoster(): ScalePoster | null {
    return localStorage.getItem(this.compressedVerticalPoster) as ScalePoster | null;
  }
  public setCompressedVerticalPoster(scale: ScalePoster): void {
    localStorage.setItem(this.compressedVerticalPoster, scale);
    this.currentScaleNormalVerticalPoster = scale;
  }

  public getCompressedHorizontalPoster(): ScalePoster | null {
    return localStorage.getItem(this.compressedHorizontalPoster) as ScalePoster | null;
  }
  public setCompressedHorizontalPoster(scale: ScalePoster): void {
    localStorage.setItem(this.compressedHorizontalPoster, scale);
    this.currentScaleHorizontalPoster = scale;
  }

  public getCompressedSpecialLicensePoster(): ScalePoster | null {
    return localStorage.getItem(this.compressedSpecialLicensePoster) as ScalePoster | null;
  }
  public setCompressedSpecialLicensePoster(scale: ScalePoster): void {
    localStorage.setItem(this.compressedSpecialLicensePoster, scale);
    this.currentScaleSpecialAndLicensePoster = scale;
  }

  public getCompressedLogoIntoPoster(): ScalePoster | null {
    return localStorage.getItem(this.compressedLogoIntoPoster) as ScalePoster | null;
  }
  public setCompressedLogoIntoPoster(scale: ScalePoster): void {
    localStorage.setItem(this.compressedLogoIntoPoster, scale);
    this.currentScaleLogoIntoPoster = scale;
  }

  public getCompressedBackgroundPresentationToHead(): ScalePoster | null {
    return localStorage.getItem(this.compressedBackgroundPresentationToHead) as ScalePoster | null;
  }
  public setCompressedBackgroundPresentationToHead(scale: ScalePoster): void {
    localStorage.setItem(this.compressedBackgroundPresentationToHead, scale);
    this.currentScaleBackgroundPresentationTopHead = scale;
  }

  public getCompressedBackgroundPresentation(): ScalePoster | null {
    return localStorage.getItem(this.compressedBackgroundPresentation) as ScalePoster | null;
  }
  public setCompressedBackgroundPresentation(scale: ScalePoster): void {
    localStorage.setItem(this.compressedBackgroundPresentation, scale);
    this.currentScaleBackgroundPresentation = scale;
  }

  public getCompressedLogoPresentationToHead(): ScalePoster | null {
    return localStorage.getItem(this.compressedLogoPresentationToHead) as ScalePoster | null;
  }
  public setCompressedLogoPresentationToHead(scale: ScalePoster): void {
    localStorage.setItem(this.compressedLogoPresentationToHead, scale);
    this.currentScaleLogoPresentationTopHead = scale;
  }

  public getCompressedLogoPresentation(): ScalePoster | null {
    return localStorage.getItem(this.compressedLogoPresentation) as ScalePoster | null;
  }
  public setCompressedLogoPresentation(scale: ScalePoster): void {
    localStorage.setItem(this.compressedLogoPresentation, scale);
    this.currentScaleLogoPresentation = scale;
  }

  public getCompressedIconLicense(): ScalePoster | null {
    return localStorage.getItem(this.compressedIconLicense) as ScalePoster | null;
  }
  public setcompressedIconLicense(scale: ScalePoster): void {
    localStorage.setItem(this.compressedIconLicense, scale);
    this.currentScaleIconLicense = scale;
  }

  public getCompressedLogoLicense(): ScalePoster | null {
    return localStorage.getItem(this.compressedLogoLicense) as ScalePoster | null;
  }
  public setCompressedLogoLicense(scale: ScalePoster): void {
    localStorage.setItem(this.compressedLogoLicense, scale);
    this.currentScaleLogoLicense = scale;
  }

  public getCompressedBackgroundLicense(): ScalePoster | null {
    return localStorage.getItem(this.compressedBackgroundLicense) as ScalePoster | null;
  }
  public setcompressedBackgroundLicense(scale: ScalePoster): void {
    localStorage.setItem(this.compressedBackgroundLicense, scale);
    this.currentScaleBackgroundLicense = scale;
  }

  public getCompressedSeasonPoster(): ScalePoster | null {
    return localStorage.getItem(this.compressedSeasonPoster) as ScalePoster | null;
  }
  public setCompressedSeasonPoster(scale: ScalePoster): void {
    localStorage.setItem(this.compressedSeasonPoster, scale);
    this.currentScaleSeasonPoster = scale;
  }

  public getCompressedEpisodePoster(): ScalePoster | null {
    return localStorage.getItem(this.compressedEpisodePoster) as ScalePoster | null;
  }
  public setCompressedEpisodePoster(scale: ScalePoster): void {
    localStorage.setItem(this.compressedEpisodePoster, scale);
    this.currentScaleEpisodePoster = scale;
  }

  constructor() { }

}
