import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputRadioButtonComponent } from './input-radio-button.component';

describe('InputRadioButtonComponent', () => {
  let component: InputRadioButtonComponent;
  let fixture: ComponentFixture<InputRadioButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputRadioButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
