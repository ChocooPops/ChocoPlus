import { TestBed } from '@angular/core/testing';

import { EditionMovieService } from './edition-movie.service';

describe('AddMovieService', () => {
  let service: EditionMovieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionMovieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
