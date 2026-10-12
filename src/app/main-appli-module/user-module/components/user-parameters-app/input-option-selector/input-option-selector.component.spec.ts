import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputOptionSelectorComponent } from './input-option-selector.component';

describe('ParameterAppliComponent', () => {
  let component: InputOptionSelectorComponent;
  let fixture: ComponentFixture<InputOptionSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputOptionSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputOptionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
