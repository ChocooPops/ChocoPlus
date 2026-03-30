import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaBackgroundComponent } from './media-background.component';

describe('MovieBackgroundComponent', () => {
  let component: MediaBackgroundComponent;
  let fixture: ComponentFixture<MediaBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaBackgroundComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MediaBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
