import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputResearchMovieComponent } from './input-research-movie.component';

describe('InputResearchComponent', () => {
  let component: InputResearchMovieComponent;
  let fixture: ComponentFixture<InputResearchMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputResearchMovieComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InputResearchMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
