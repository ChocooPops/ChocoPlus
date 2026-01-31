import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { EditTypePoster } from '../../models/edit-type-movie.interface';
import { InputPosterModel } from '../../models/input-poster.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { MediaModel } from '../../../media-module/models/media.interface';

@Injectable({
  providedIn: 'root'
})
export class EditionMediaService {

  protected id: number = 0;

  protected radioButtonHorizontalSameAsBackSubject: BehaviorSubject<SimpleModel[]> = new BehaviorSubject<SimpleModel[]>(this.getInitialRadioButtonPosterSameAsBackground());
  protected radioButtonHorizontalSameAsBack$: Observable<SimpleModel[]> = this.radioButtonHorizontalSameAsBackSubject.asObservable();

  constructor(protected http: HttpClient) { }

  protected getId(): number {
    this.id++;
    return this.id;
  }

  protected getInitialRadioButtonPosterSameAsBackground(): SimpleModel[] {
    return [
      {
        id: 300,
        name: 'Oui',
        value: true,
        state: false
      },
      {
        id: 400,
        name: 'Non',
        value: false,
        state: true
      }
    ]
  }

  protected getInitialPosters(): InputPosterModel[] {
    return [
      {
        id: this.getId(),
        srcPoster: undefined,
        typePoster: [
          {
            id: this.getId(),
            type_id: SelectionType.NORMAL_POSTER
          }
        ]
      }
    ]
  }

  protected readonly typeSelectionPoster: EditTypePoster[] = [
    {
      id: 1,
      name: "Affiche Normal",
      type: SelectionType.NORMAL_POSTER
    },
    {
      id: 2,
      name: "Affiche Special",
      type: SelectionType.SPECIAL_POSTER
    },
    {
      id: 3,
      name: "Affiche License",
      type: SelectionType.LICENSE_POSTER
    }
  ]

  public getRadioButtonHorizontalSameAsBack(): Observable<SimpleModel[]> {
    return this.radioButtonHorizontalSameAsBack$;
  }

  public getSelectionPosterById(type: SelectionType): String {
    return this.typeSelectionPoster.find((t) => t.type === type)?.name || "";
  }

  public getAllTypeSelectionPoster(): EditTypePoster[] {
    return this.typeSelectionPoster;
  }

  protected getNewPoster(): InputPosterModel {
    const newPoster: InputPosterModel = {
      id: this.getId(),
      srcPoster: undefined,
      typePoster: [
        {
          id: this.getId(),
          type_id: SelectionType.NORMAL_POSTER
        }
      ]
    }
    return newPoster;
  }

  protected setPosterForMediaResearched(movie: MediaModel): InputPosterModel[] {
    const posters: InputPosterModel[] = [];
    const postersName: SimpleModel[] = [];
    movie.srcPosterNormal?.forEach((poster) => {
      const posterTmp: InputPosterModel = {
        id: this.getId(),
        srcPoster: poster,
        typePoster: [{
          id: this.getId(),
          type_id: SelectionType.NORMAL_POSTER
        }]
      };
      posters.push(posterTmp);
      postersName.push({ id: posterTmp.id, name: posterTmp.srcPoster?.toString() || '', value: 1 });
    });

    movie.srcPosterSpecial?.forEach((poster) => {
      if (postersName.some(item => item.name === poster)) {
        const posterIndex: number = posters.findIndex(item => item.srcPoster === poster);
        posters[posterIndex].typePoster.push({
          id: this.getId(),
          type_id: SelectionType.SPECIAL_POSTER
        })
      } else {
        const posterTmp: InputPosterModel = {
          id: this.getId(),
          srcPoster: poster.toString(),
          typePoster: [{
            id: this.getId(),
            type_id: SelectionType.SPECIAL_POSTER
          }]
        };
        posters.push(posterTmp);
        postersName.push({ id: posterTmp.id, name: posterTmp.srcPoster?.toString() || '', value: 2 });
      }
    });

    movie.srcPosterLicense?.forEach((poster) => {
      if (postersName.some(item => item.name === poster)) {
        const posterIndex: number = posters.findIndex(item => item.srcPoster === poster);
        posters[posterIndex].typePoster.push({
          id: this.getId(),
          type_id: SelectionType.LICENSE_POSTER
        })
      } else {
        const posterTmp: InputPosterModel = {
          id: this.getId(),
          srcPoster: poster.toString(),
          typePoster: [{
            id: this.getId(),
            type_id: SelectionType.LICENSE_POSTER
          }]
        };
        posters.push(posterTmp);
        postersName.push({ id: posterTmp.id, name: posterTmp.srcPoster?.toString() || '', value: 3 });
      }
    });

    return posters;
  }

  protected setPosterHorizontalResearched(movie: MediaModel, state: boolean): InputPosterModel[] {
    const posters: InputPosterModel[] = [];
    if (state && movie.srcBackgroundImage) {
      posters.push({
        id: this.getId(),
        srcPoster: movie.srcBackgroundImage,
        typePoster: [{
          id: this.getId(),
          type_id: SelectionType.HORIZONTAL_POSTER
        }]
      })
    }
    movie.srcPosterHorizontal?.forEach((poster: string) => {
      posters.push({
        id: this.getId(),
        srcPoster: poster,
        typePoster: [{
          id: this.getId(),
          type_id: SelectionType.NORMAL_POSTER
        }]
      })
    })
    if (posters.length <= 0) {
      posters.push({
        id: this.getId(),
        srcPoster: null,
        typePoster: [{
          id: this.getId(),
          type_id: SelectionType.NORMAL_POSTER
        }]
      })
    }
    return posters;
  }

}
