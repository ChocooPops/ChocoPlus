import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextAreaEditionComponent } from './input-text-area-edition.component';

describe('InputTextAreaEditionComponent', () => {
  let component: InputTextAreaEditionComponent;
  let fixture: ComponentFixture<InputTextAreaEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextAreaEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTextAreaEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
