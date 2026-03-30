import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaHorizontalPageComponent } from './media-horizontal-page.component';

describe('MediaHorizontalPageComponent', () => {
  let component: MediaHorizontalPageComponent;
  let fixture: ComponentFixture<MediaHorizontalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaHorizontalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaHorizontalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
