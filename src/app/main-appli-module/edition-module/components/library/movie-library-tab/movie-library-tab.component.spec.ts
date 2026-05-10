import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaLibraryTabComponent } from './movie-library-tab.component';

describe('MediaLibraryTabComponent', () => {
  let component: MediaLibraryTabComponent;
  let fixture: ComponentFixture<MediaLibraryTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaLibraryTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaLibraryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
