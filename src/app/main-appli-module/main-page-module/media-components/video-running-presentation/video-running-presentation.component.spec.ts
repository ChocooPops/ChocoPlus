import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoRunningPresentationComponent } from './video-running-presentation.component';

describe('HomeMoviePresentationComponent', () => {
  let component: VideoRunningPresentationComponent;
  let fixture: ComponentFixture<VideoRunningPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoRunningPresentationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VideoRunningPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
