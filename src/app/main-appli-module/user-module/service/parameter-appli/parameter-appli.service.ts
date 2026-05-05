import { Injectable } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { ScalePoster } from '../../../common-module/models/scale-poster.enum';
import { ParamaterAppliModel } from '../../dto/parameter-appli.interface';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { FormatMediaPageService } from '../../../media-module/services/format-media-page/format-media-page-button.service';
import { FormatMediaPageModel } from '../../../media-module/models/format-media-page-enum';

@Injectable({
  providedIn: 'root'
})
export class ParameterAppliService {

  constructor(private readonly formatPosterService: FormatPosterService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly formatMediaPageService: FormatMediaPageService
  ) { }

  private id: number = 0;

  private radioButtonPosterFilm: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_VERTICAL_POSTERS",
      radioButton: this.getRadioButtonForVerticalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_HORIZONTAL_POSTERS",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_SPECIAL_POSTERS",
      radioButton: this.getRadioButtonForVerticalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.LOGO_QUALITY_INTO_POSTERS",
      radioButton: this.getRadioButtonForLogoScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_BACKGROUND_TOP_PAGE",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.LOGO_QUALITY_TOP_PAGE",
      radioButton: this.getRadioButtonForLogoScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.BACKGROUND_QUALITY",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.LOGO_QUALITY_INTO_BACKGROUND",
      radioButton: this.getRadioButtonForLogoScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_SEASON_POSTERS",
      radioButton: this.getRadioButtonForSeasonPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_EPISODE_POSTERS",
      radioButton: this.getRadioButtonForEpisodePoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_CREDIT_POSTERS",
      radioButton: this.getRadioButtonForCreditPoster(),
      call: null
    }
  ]

  private radioButtonPosterLicense: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_ICON_LICENS",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_LOGO_LICENSE",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.QUALITY_BACKGROUND_LICENSE",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    }
  ]

  private radioButtonFormatPoster: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.HOME_PAGE",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.MOVIE_PAGE",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.SERIES_PAGE",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.CATALOG_PAGE",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.SEARCH_PAGE",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.LICENSE_PAGE",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.MYLIST_PAGE",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.DYNAMIC_MEDIA_PAGE",
      radioButton: this.getRadioButtonForMediaFormat(),
      call: null
    }
  ]

  private radioButtonOtherOption: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "USER.APP_SETTINGS.LAUNCH_PAGE",
      radioButton: [
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.HOME_PAGE",
          value: PageModel.PAGE_HOME,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.SEARCH_PAGE",
          value: PageModel.PAGE_RESEARCH,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.MOVIE_PAGE",
          value: PageModel.PAGE_MOVIE,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.SERIES_PAGE",
          value: PageModel.PAGE_SERIES,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.CATALOG_PAGE",
          value: PageModel.PAGE_CATALOG,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.MYLIST_PAGE",
          value: PageModel.PAGE_MYLIST,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.EDITION_PAGE",
          value: PageModel.PAGE_EDITION,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.USER_PAGE",
          value: PageModel.PAGE_USER,
          state: false
        },
        {
          id: this.getId(),
          name: "USER.APP_SETTINGS.LAST_PAGE_VISITED",
          value: PageModel.DEFAULT_PAGE,
          state: false
        },
      ],
      call: null
    }
  ]

  public initRadioButton(): void {
    //INIT RADIO BUTTON FOR MOVIE POSTER;
    const callBackMoviePosterScale: any[] = [
      (scale: ScalePoster) => this.compressedPosterService.setCompressedVerticalPoster(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedHorizontalPoster(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedSpecialLicensePoster(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedLogoIntoPoster(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedBackgroundPresentationToHead(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedLogoPresentationToHead(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedBackgroundPresentation(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedLogoPresentation(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedSeasonPoster(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedEpisodePoster(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedCreditPoster(scale)
    ]

    const moviePosterScale: ScalePoster[] = [];
    const vertical: ScalePoster | null = this.compressedPosterService.getCompressedVerticalPoster();
    const horizontal: ScalePoster | null = this.compressedPosterService.getCompressedHorizontalPoster();
    const special: ScalePoster | null = this.compressedPosterService.getCompressedSpecialLicensePoster();
    const logoMovie: ScalePoster | null = this.compressedPosterService.getCompressedLogoIntoPoster();
    const backHeadToHead: ScalePoster | null = this.compressedPosterService.getCompressedBackgroundPresentationToHead();
    const logoHeadToHead: ScalePoster | null = this.compressedPosterService.getCompressedLogoPresentationToHead();
    const backHead: ScalePoster | null = this.compressedPosterService.getCompressedBackgroundPresentation();
    const logoHead: ScalePoster | null = this.compressedPosterService.getCompressedLogoPresentation();
    const season: ScalePoster | null = this.compressedPosterService.getCompressedSeasonPoster();
    const episode: ScalePoster | null = this.compressedPosterService.getCompressedEpisodePoster();
    const credit: ScalePoster | null = this.compressedPosterService.getCompressedCreditPoster();

    if (vertical) moviePosterScale.push(vertical);
    if (horizontal) moviePosterScale.push(horizontal);
    if (special) moviePosterScale.push(special);
    if (logoMovie) moviePosterScale.push(logoMovie);
    if (backHeadToHead) moviePosterScale.push(backHeadToHead);
    if (logoHeadToHead) moviePosterScale.push(logoHeadToHead);
    if (backHead) moviePosterScale.push(backHead);
    if (logoHead) moviePosterScale.push(logoHead);
    if (season) moviePosterScale.push(season);
    if (episode) moviePosterScale.push(episode);
    if (credit) moviePosterScale.push(credit);
    
    if (this.radioButtonPosterFilm.length === moviePosterScale.length) {
      for (let i = 0; i < this.radioButtonPosterFilm.length; i++) {
        this.radioButtonPosterFilm[i].call = callBackMoviePosterScale[i];
        for (let j = 0; j < this.radioButtonPosterFilm[i].radioButton.length; j++) {
          if (this.radioButtonPosterFilm[i].radioButton[j].value && this.radioButtonPosterFilm[i].radioButton[j].value === moviePosterScale[i]) {
            this.radioButtonPosterFilm[i].radioButton[j].state = true;
          } else {
            this.radioButtonPosterFilm[i].radioButton[j].state = false;
          }
        }
      }
    }

    //INIT RADIO BUTTON FOR LICENCE POSTER;
    const callBackLicensePosterScale: any[] = [
      (scale: ScalePoster) => this.compressedPosterService.setcompressedIconLicense(scale),
      (scale: ScalePoster) => this.compressedPosterService.setCompressedLogoLicense(scale),
      (scale: ScalePoster) => this.compressedPosterService.setcompressedBackgroundLicense(scale)
    ]

    const licensePosterScale: ScalePoster[] = [];
    const icon: ScalePoster | null = this.compressedPosterService.getCompressedIconLicense();
    const logoLicense: ScalePoster | null = this.compressedPosterService.getCompressedLogoLicense();
    const backLicense: ScalePoster | null = this.compressedPosterService.getCompressedBackgroundLicense();

    if (icon) licensePosterScale.push(icon);
    if (logoLicense) licensePosterScale.push(logoLicense);
    if (backLicense) licensePosterScale.push(backLicense);

    if (this.radioButtonPosterLicense.length === licensePosterScale.length) {
      for (let i = 0; i < this.radioButtonPosterLicense.length; i++) {
        this.radioButtonPosterLicense[i].call = callBackLicensePosterScale[i];
        for (let j = 0; j < this.radioButtonPosterLicense[i].radioButton.length; j++) {
          if (this.radioButtonPosterLicense[i].radioButton[j].value && this.radioButtonPosterLicense[i].radioButton[j].value === licensePosterScale[i]) {
            this.radioButtonPosterLicense[i].radioButton[j].state = true;
          } else {
            this.radioButtonPosterLicense[i].radioButton[j].state = false;
          }
        }
      }
    }

    //INIT FORMAT BUTTON FOR FORMAT POSTER;
    const callBackFormatPoster: any[] = [
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterHome(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterMovie(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterSeries(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterCatalog(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterResearch(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterLicense(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterMyList(format),
      (format: FormatMediaPageModel) => this.formatMediaPageService.setFormatPosterHome(format)
    ]
    const format: (FormatPosterModel | FormatMediaPageModel)[] = [this.formatPosterService.getFormatPosterHomeValue(), this.formatPosterService.getFormatPosterMovieValue(), this.formatPosterService.getFormatPosterSeriesValue(), this.formatPosterService.getFormatPosterCatalogValue(), this.formatPosterService.getFormatPosterResearchValue(), this.formatPosterService.getFormatPosterLicenseValue(), this.formatPosterService.getFormatPosterMyListValue(), this.formatMediaPageService.getCurrentFormatMediaPageValue()];
    if (this.radioButtonFormatPoster.length === format.length) {
      for (let i: number = 0; i < this.radioButtonFormatPoster.length; i++) {
        this.radioButtonFormatPoster[i].call = callBackFormatPoster[i];
        for (let j = 0; j < this.radioButtonFormatPoster[i].radioButton.length; j++) {
          if (this.radioButtonFormatPoster[i].radioButton[j].value && this.radioButtonFormatPoster[i].radioButton[j].value === format[i]) {
            this.radioButtonFormatPoster[i].radioButton[j].state = true;
          } else {
            this.radioButtonFormatPoster[i].radioButton[j].state = false;
          }
        }
      }
    }

    //INIT OPENING PAGE BUTTON;
    const callBackOpeningPage: any[] = [
      (page : PageModel) => this.loadOpeningPageService.setOpeningPage(page)
    ];
    this.radioButtonOtherOption[0].call = callBackOpeningPage[0];
    for (let i: number = 0; i < this.radioButtonOtherOption[0].radioButton.length; i++) {
      if (this.radioButtonOtherOption[0].radioButton[i].value && this.radioButtonOtherOption[0].radioButton[i].value === this.loadOpeningPageService.getOpeningPage()) {
        this.radioButtonOtherOption[0].radioButton[i].state = true;
      } else {
        this.radioButtonOtherOption[0].radioButton[i].state = false;
      }
    }
  }

  public getRadioButtonForPosterFilm(): ParamaterAppliModel[] {
    return this.radioButtonPosterFilm;
  }

  public getRadioButtonForPosterLicense(): ParamaterAppliModel[] {
    return this.radioButtonPosterLicense;
  }

  public getRadioButtonForFormatPoster(): ParamaterAppliModel[] {
    return this.radioButtonFormatPoster;
  }

  public getRadioButtonOtherOption(): ParamaterAppliModel[] {
    return this.radioButtonOtherOption;
  }

  private getId(): number {
    this.id++;
    return this.id;
  }

  private getRadioButtonForVerticalScale(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "100px",
        value: ScalePoster.SCALE_100h,
        state: false
      },
      {
        id: this.getId(),
        name: "300px",
        value: ScalePoster.SCALE_300h,
        state: false
      },
      {
        id: this.getId(),
        name: "350px",
        value: ScalePoster.SCALE_350h,
        state: false
      },
      {
        id: this.getId(),
        name: "600px",
        value: ScalePoster.SCALE_600h,
        state: false
      },
      {
        id: this.getId(),
        name: "900px",
        value: ScalePoster.SCALE_900h,
        state: false
      },
      {
        id: this.getId(),
        name: "1400px",
        value: ScalePoster.SCALE_1400h,
        state: false
      },
      {
        id: this.getId(),
        name: "1920px",
        value: ScalePoster.SCALE_1920h,
        state: false
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.ORIGINAL_QUALITY",
        value: ScalePoster.SCALE_ORIGINAL,
        state: false
      }
    ]
  }

  private getRadioButtonForHorizontalScale(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "100px",
        value: ScalePoster.SCALE_100w,
        state: false
      },
      {
        id: this.getId(),
        name: "300px",
        value: ScalePoster.SCALE_300w,
        state: false
      },
      {
        id: this.getId(),
        name: "350px",
        value: ScalePoster.SCALE_350w,
        state: false
      },
      {
        id: this.getId(),
        name: "600px",
        value: ScalePoster.SCALE_600w,
        state: false
      },
      {
        id: this.getId(),
        name: "900px",
        value: ScalePoster.SCALE_900w,
        state: false
      },
      {
        id: this.getId(),
        name: "1400px",
        value: ScalePoster.SCALE_1400w,
        state: false
      },
      {
        id: this.getId(),
        name: "1920px",
        value: ScalePoster.SCALE_1920w,
        state: false
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.ORIGINAL_QUALITY",
        value: ScalePoster.SCALE_ORIGINAL,
        state: false
      }
    ]
  }

  private getRadioButtonForLogoScale(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "200px",
        value: ScalePoster.SCALE_200w,
        state: false
      },
      {
        id: this.getId(),
        name: "300px",
        value: ScalePoster.SCALE_300w,
        state: false
      },
      {
        id: this.getId(),
        name: "500px",
        value: ScalePoster.SCALE_500w,
        state: false
      },
      {
        id: this.getId(),
        name: "700px",
        value: ScalePoster.SCALE_700w,
        state: false
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.ORIGINAL_QUALITY",
        value: ScalePoster.SCALE_ORIGINAL,
        state: false
      }
    ]
  }

  private getRadioButtonForAllFormatPoster(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.VERTICAL",
        value: FormatPosterModel.VERTICAL,
        state: false
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.HORIZONTAL",
        value: FormatPosterModel.HORIZONTAL,
        state: false
      }
    ]
  }

  private getRadioButtonForMediaFormat(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.VERTICAL",
        value: FormatMediaPageModel.VERTICAL,
        state: false
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.HORIZONTAL",
        value: FormatMediaPageModel.HORIZONTAL,
        state: false
      }
    ]
  }

  private getRadioButtonForSeasonPoster(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "300px",
        value: ScalePoster.SCALE_300h,
        state: false,
      },
      {
        id: this.getId(),
        name: "600px",
        value: ScalePoster.SCALE_600h,
        state: false,
      },
      {
        id: this.getId(),
        name: "900px",
        value: ScalePoster.SCALE_900h,
        state: false,
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.ORIGINAL_QUALITY",
        value: ScalePoster.SCALE_ORIGINAL,
        state: false
      }
    ]
  }

  private getRadioButtonForCreditPoster(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "100px",
        value: ScalePoster.SCALE_100h,
        state: false,
      },
      {
        id: this.getId(),
        name: "300px",
        value: ScalePoster.SCALE_300h,
        state: false,
      },
      {
        id: this.getId(),
        name: "600px",
        value: ScalePoster.SCALE_600h,
        state: false,
      },
      {
        id: this.getId(),
        name: "900px",
        value: ScalePoster.SCALE_900h,
        state: false,
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.ORIGINAL_QUALITY",
        value: ScalePoster.SCALE_ORIGINAL,
        state: false
      }
    ]
  }

  private getRadioButtonForEpisodePoster(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "300px",
        value: ScalePoster.SCALE_300w,
        state: false,
      },
      {
        id: this.getId(),
        name: "600px",
        value: ScalePoster.SCALE_600w,
        state: false,
      },
      {
        id: this.getId(),
        name: "900px",
        value: ScalePoster.SCALE_900w,
        state: false,
      },
      {
        id: this.getId(),
        name: "USER.APP_SETTINGS.ORIGINAL_QUALITY",
        value: ScalePoster.SCALE_ORIGINAL,
        state: false
      }
    ]
  }

  onChangeEmitToPosterFilm(idParam: number, idRadioButton: number): void {
    const indexParam: number = this.radioButtonPosterFilm.findIndex((item: ParamaterAppliModel) => item.id === idParam);
    if (indexParam >= 0) {
      this.radioButtonPosterFilm[indexParam].radioButton.forEach((button: SimpleModel) => {
        if (button.id === idRadioButton) {
          this.radioButtonPosterFilm[indexParam].call(button.value);
          button.state = true;
        } else {
          button.state = false;
        }
      })
    }
  }

  onChangeEmitToPosterLicense(idParam: number, idRadioButton: number): void {
    const indexParam: number = this.radioButtonPosterLicense.findIndex((item: ParamaterAppliModel) => item.id === idParam);
    if (indexParam >= 0) {
      this.radioButtonPosterLicense[indexParam].radioButton.forEach((button: SimpleModel) => {
        if (button.id === idRadioButton) {
          this.radioButtonPosterLicense[indexParam].call(button.value);
          button.state = true;
        } else {
          button.state = false;
        }
      })
    }
  }

  onChangeEmitToPosterFormat(idParam: number, idRadioButton: number): void {
    const indexParam: number = this.radioButtonFormatPoster.findIndex((item: ParamaterAppliModel) => item.id === idParam);
    if (indexParam >= 0) {
      this.radioButtonFormatPoster[indexParam].radioButton.forEach((button: SimpleModel) => {
        if (button.id === idRadioButton) {
          this.radioButtonFormatPoster[indexParam].call(button.value);
          button.state = true;
        } else {
          button.state = false;
        }
      })
    }
  }

  onChangeEmitToOpeningPage(idParam: number, idRadioButton: number): void {
    const indexParam: number = this.radioButtonOtherOption.findIndex((item: ParamaterAppliModel) => item.id === idParam);
    if (indexParam >= 0) {
      this.radioButtonOtherOption[indexParam].radioButton.forEach((button: SimpleModel) => {
        if (button.id === idRadioButton) {
          this.radioButtonOtherOption[indexParam].call(button.value);
          button.state = true;
        } else {
          button.state = false;
        }
      })
    }
  }

}
