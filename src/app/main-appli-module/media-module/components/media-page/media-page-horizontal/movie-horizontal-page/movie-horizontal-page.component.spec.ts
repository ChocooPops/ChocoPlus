import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieHorizontalPageComponent } from './movie-horizontal-page.component';

describe('MovieHorizontalPageComponent', () => {
  let component: MovieHorizontalPageComponent;
  let fixture: ComponentFixture<MovieHorizontalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieHorizontalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieHorizontalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
