import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNumberEditionComponent } from './input-number-edition.component';

describe('InputNumberEditionComponent', () => {
  let component: InputNumberEditionComponent;
  let fixture: ComponentFixture<InputNumberEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputNumberEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputNumberEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
