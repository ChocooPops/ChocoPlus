import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesHorizontalPageComponent } from './series-horizontal-page.component';

describe('SeriesHorizontalPageComponent', () => {
  let component: SeriesHorizontalPageComponent;
  let fixture: ComponentFixture<SeriesHorizontalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesHorizontalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeriesHorizontalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
