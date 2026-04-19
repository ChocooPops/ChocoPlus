import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaHorizontalBackgroundComponent } from './media-horizontal-background.component';

describe('MediaHorizontalBackgroundComponent', () => {
  let component: MediaHorizontalBackgroundComponent;
  let fixture: ComponentFixture<MediaHorizontalBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaHorizontalBackgroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaHorizontalBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
