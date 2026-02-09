import { Injectable } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { ScalePoster } from '../../../common-module/models/scale-poster.enum';
import { ParamaterAppliModel } from '../../dto/parameter-appli.interface';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';

@Injectable({
  providedIn: 'root'
})
export class ParameterAppliService {

  constructor(private formatPosterService: FormatPosterService,
    private compressedPosterService: CompressedPosterService,
    private loadOpeningPageService: LoadOpeningPageService
  ) { }

  private id: number = 0;

  private radioButtonPosterFilm: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "Qualité des posters verticaux",
      radioButton: this.getRadioButtonForVerticalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des poster horizontaux",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des posters spéciaux",
      radioButton: this.getRadioButtonForVerticalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des logos dans les posters",
      radioButton: this.getRadioButtonForLogoScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des arrières plans à l'en-tête de la page",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des logos à l'en-tête de la page",
      radioButton: this.getRadioButtonForLogoScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des arrières plans",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des logos dans l'arrière plan",
      radioButton: this.getRadioButtonForLogoScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des posters des saisons",
      radioButton: this.getRadioButtonForSeasonPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des posters des épisodes",
      radioButton: this.getRadioButtonForEpisodePoster(),
      call: null
    }
  ]

  private radioButtonPosterLicense: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "Qualité des icons",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des logos",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    },
    {
      id: this.getId(),
      name: "Qualité des arrières plans",
      radioButton: this.getRadioButtonForHorizontalScale(),
      call: null
    }
  ]

  private radioButtonFormatPoster: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "Page d'accueil",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "Page des films",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "Page des séries",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "Page de recherche",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "Page des licenses",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    },
    {
      id: this.getId(),
      name: "Page MyList",
      radioButton: this.getRadioButtonForAllFormatPoster(),
      call: null
    }
  ]

  private radioButtonOtherOption: ParamaterAppliModel[] = [
    {
      id: this.getId(),
      name: "Page de démarrage",
      radioButton: [
        {
          id: this.getId(),
          name: "Page d'accueil",
          value: PageModel.PAGE_HOME,
          state: false
        },
        {
          id: this.getId(),
          name: "Page de recherche",
          value: PageModel.PAGE_RESEARCH,
          state: false
        },
        {
          id: this.getId(),
          name: "Page des films",
          value: PageModel.PAGE_MOVIE,
          state: false
        },
        {
          id: this.getId(),
          name: "Page des séries",
          value: PageModel.PAGE_SERIES,
          state: false
        },
        {
          id: this.getId(),
          name: "Page mylist",
          value: PageModel.PAGE_MYLIST,
          state: false
        },
        {
          id: this.getId(),
          name: "Page d'édition",
          value: PageModel.PAGE_EDITION,
          state: false
        },
        {
          id: this.getId(),
          name: "Page de l'utilisateur",
          value: PageModel.PAGE_USER,
          state: false
        },
        {
          id: this.getId(),
          name: "Dernière page visitée",
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
      (scale: ScalePoster) => this.compressedPosterService.setCompressedEpisodePoster(scale)
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

    if (this.radioButtonPosterFilm.length === moviePosterScale.length) {
      for (let i = 0; i < this.radioButtonPosterFilm.length; i++) {
        this.radioButtonPosterFilm[i].call = callBackMoviePosterScale[i];
        for (let j = 0; j < this.radioButtonPosterFilm[i].radioButton.length; j++) {
          if (this.radioButtonPosterFilm[i].radioButton[j].value && this.radioButtonPosterFilm[i].radioButton[j].value === moviePosterScale[i]) {
            this.radioButtonPosterFilm[i].radioButton[j].state = true;
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
          }
        }
      }
    }

    //INIT FORMAT BUTTON FOR FORMAT POSTER;
    const callBackFormatPoster: any[] = [
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterHome(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterMovie(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterSeries(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterResearch(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterLicense(format),
      (format: FormatPosterModel) => this.formatPosterService.setFormatPosterMyList(format)
    ]
    const format: FormatPosterModel[] = [this.formatPosterService.getFormatPosterHomeValue(), this.formatPosterService.getFormatPosterMovieValue(), this.formatPosterService.getFormatPosterSeriesValue(), this.formatPosterService.getFormatPosterResearchValue(), this.formatPosterService.getFormatPosterLicenseValue(), this.formatPosterService.getFormatPosterMyListValue()];
    if (this.radioButtonFormatPoster.length === format.length) {
      for (let i: number = 0; i < this.radioButtonFormatPoster.length; i++) {
        this.radioButtonFormatPoster[i].call = callBackFormatPoster[i];
        for (let j = 0; j < this.radioButtonFormatPoster[i].radioButton.length; j++) {
          if (this.radioButtonFormatPoster[i].radioButton[j].value && this.radioButtonFormatPoster[i].radioButton[j].value === format[i]) {
            this.radioButtonFormatPoster[i].radioButton[j].state = true;
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
        name: "Qualité originale",
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
        name: "Qualité originale",
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
        name: "Qualité originale",
        value: ScalePoster.SCALE_ORIGINAL,
        state: false
      }
    ]
  }

  private getRadioButtonForAllFormatPoster(): SimpleModel[] {
    return [
      {
        id: this.getId(),
        name: "Vertical",
        value: FormatPosterModel.VERTICAL,
        state: false
      },
      {
        id: this.getId(),
        name: "Horizontal",
        value: FormatPosterModel.HORIZONTAL,
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
        name: "Qualité originale",
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
        name: "Qualité originale",
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
