import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonMoveComponent } from './button-move.component';

describe('ButtonMoveComponent', () => {
  let component: ButtonMoveComponent;
  let fixture: ComponentFixture<ButtonMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonMoveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
