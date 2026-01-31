import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPlayingComponent } from './video-playing.component';

describe('VideoPlayingComponent', () => {
  let component: VideoPlayingComponent;
  let fixture: ComponentFixture<VideoPlayingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoPlayingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoPlayingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
