import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPosterEditionComponent } from './input-poster-edition.component';

describe('InputPosterComponent', () => {
  let component: InputPosterEditionComponent;
  let fixture: ComponentFixture<InputPosterEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPosterEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputPosterEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
