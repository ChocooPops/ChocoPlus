import { TestBed } from '@angular/core/testing';

import { UserHistoricService } from './user-historic.service';

describe('UserHistoricService', () => {
  let service: UserHistoricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserHistoricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
