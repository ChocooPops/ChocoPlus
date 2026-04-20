import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodePosterHorizontalViewComponent } from './episode-poster-horizontal-view.component';

describe('EpisodePosterHorizontalViewComponent', () => {
  let component: EpisodePosterHorizontalViewComponent;
  let fixture: ComponentFixture<EpisodePosterHorizontalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePosterHorizontalViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpisodePosterHorizontalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
