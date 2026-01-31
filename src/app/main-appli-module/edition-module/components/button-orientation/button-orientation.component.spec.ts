import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonOrientationComponent } from './button-orientation.component';

describe('ButtonOrientationComponent', () => {
  let component: ButtonOrientationComponent;
  let fixture: ComponentFixture<ButtonOrientationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonOrientationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonOrientationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
