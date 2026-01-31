import { TestBed } from '@angular/core/testing';

import { SavePathService } from './save-path.service';

describe('SavePathService', () => {
  let service: SavePathService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavePathService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
