import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextEditionComponent } from './input-text-edition.component';

describe('InputTextEditionComponent', () => {
  let component: InputTextEditionComponent;
  let fixture: ComponentFixture<InputTextEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTextEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
