import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSelectionTypeComponent } from './input-selection-type.component';

describe('InputSelectionTypeComponent', () => {
  let component: InputSelectionTypeComponent;
  let fixture: ComponentFixture<InputSelectionTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSelectionTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputSelectionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
