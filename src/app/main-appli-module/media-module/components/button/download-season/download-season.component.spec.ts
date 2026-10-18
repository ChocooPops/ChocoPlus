import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadSeasonComponent } from './download-season.component';

describe('DownloadSeasonComponent', () => {
  let component: DownloadSeasonComponent;
  let fixture: ComponentFixture<DownloadSeasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadSeasonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
