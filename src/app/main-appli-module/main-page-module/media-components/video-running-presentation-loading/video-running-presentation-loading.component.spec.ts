import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoRunningPresentationLoadingComponent } from './video-running-presentation-loading.component';

describe('MoviePresentationLoadingComponent', () => {
  let component: VideoRunningPresentationLoadingComponent;
  let fixture: ComponentFixture<VideoRunningPresentationLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoRunningPresentationLoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VideoRunningPresentationLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
