import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPosterHorizontalEditionComponent } from './input-poster-horizontal-edition.component';

describe('InputPosterHorizontalEditionComponent', () => {
  let component: InputPosterHorizontalEditionComponent;
  let fixture: ComponentFixture<InputPosterHorizontalEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPosterHorizontalEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputPosterHorizontalEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
