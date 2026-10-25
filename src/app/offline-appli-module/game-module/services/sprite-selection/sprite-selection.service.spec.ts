import { TestBed } from '@angular/core/testing';

import { SpriteSelectionService } from './sprite-selection.service';

describe('SpriteSelectionService', () => {
  let service: SpriteSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpriteSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
