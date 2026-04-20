import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodePosterHorizontalViewLoadingComponent } from './episode-poster-horizontal-view-loading.component';

describe('EpisodePosterHorizontalViewLoadingComponent', () => {
  let component: EpisodePosterHorizontalViewLoadingComponent;
  let fixture: ComponentFixture<EpisodePosterHorizontalViewLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePosterHorizontalViewLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpisodePosterHorizontalViewLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
