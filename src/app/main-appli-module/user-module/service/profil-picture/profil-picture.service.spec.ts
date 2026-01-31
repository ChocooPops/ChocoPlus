import { TestBed } from '@angular/core/testing';

import { ProfilPictureService } from './profil-picture.service';

describe('ProfilPictureService', () => {
  let service: ProfilPictureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfilPictureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
