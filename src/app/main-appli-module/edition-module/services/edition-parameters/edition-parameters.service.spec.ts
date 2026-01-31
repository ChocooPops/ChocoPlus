import { TestBed } from '@angular/core/testing';

import { EditionParametersService } from './edition-parameters.service';

describe('EditionParametersService', () => {
  let service: EditionParametersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionParametersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
