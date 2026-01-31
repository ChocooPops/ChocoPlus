import { TestBed } from '@angular/core/testing';

import { UserParametersService } from './user-parameters.service';

describe('UserParametersService', () => {
  let service: UserParametersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserParametersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
