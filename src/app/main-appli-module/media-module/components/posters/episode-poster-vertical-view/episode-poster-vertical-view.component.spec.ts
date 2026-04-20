import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodePosterVerticalViewComponent } from './episode-poster-vertical-view.component';

describe('EpisodePosterVerticalViewComponent', () => {
  let component: EpisodePosterVerticalViewComponent;
  let fixture: ComponentFixture<EpisodePosterVerticalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePosterVerticalViewComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EpisodePosterVerticalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
