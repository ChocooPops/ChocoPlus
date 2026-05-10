import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesLibraryTabComponent } from './series-library-tab.component';

describe('SeriesLibraryTabComponent', () => {
  let component: SeriesLibraryTabComponent;
  let fixture: ComponentFixture<SeriesLibraryTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesLibraryTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeriesLibraryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
