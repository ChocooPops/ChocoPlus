import { Component, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { InputResearchAbstract } from '../input-research-abstract';
import { SelectionType } from '../../../../media-module/models/selection-type.enum';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { ScalePoster } from '../../../../common-module/models/scale-poster.enum';
import { MovieService } from '../../../../media-module/services/movie/movie.service';
import { MovieModel } from '../../../../media-module/models/movie-model';

@Component({
  selector: 'app-input-research-movie',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './input-research-movie.component.html',
  styleUrls: ['./input-research-movie.component.css', '../../../styles/search.css']
})
export class InputResearchMovieComponent extends InputResearchAbstract<MovieModel> {

  protected override placeHolder: string = 'Rechercher un film';

  constructor(fb: FormBuilder,
    elementRef: ElementRef,
    private movieService: MovieService,
    private compressedPosterService: CompressedPosterService
  ) {
    super(fb, elementRef);
  }

  getPathPosterByMovie(media: MovieModel): string {
    let srcPoster = this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, media, ScalePoster.SCALE_100h);
    if (srcPoster) {
      return srcPoster;
    } else {
      return '';
    }
  }

  protected override startResearch(): void {
    const value: string = this.getValueInput();
    this.movieService.fetchMovieWanted(value).subscribe((data) => {
      this.contentWanted = data;
    });
  }

}
