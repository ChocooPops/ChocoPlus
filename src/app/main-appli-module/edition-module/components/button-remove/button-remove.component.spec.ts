import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonRemoveComponent } from './button-remove.component';

describe('ButtonRemoveComponent', () => {
  let component: ButtonRemoveComponent;
  let fixture: ComponentFixture<ButtonRemoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonRemoveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
