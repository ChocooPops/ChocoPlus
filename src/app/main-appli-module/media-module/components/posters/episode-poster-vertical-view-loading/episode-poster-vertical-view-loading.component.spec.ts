import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpisodePosterVerticalViewLoadingComponent } from './episode-poster-vertical-view-loading.component';

describe('EpisodePosterVerticalViewLoadingComponent', () => {
  let component: EpisodePosterVerticalViewLoadingComponent;
  let fixture: ComponentFixture<EpisodePosterVerticalViewLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePosterVerticalViewLoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EpisodePosterVerticalViewLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
