import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTimeEditionComponent } from './input-time-edition.component';

describe('InputTimeEditionComponent', () => {
  let component: InputTimeEditionComponent;
  let fixture: ComponentFixture<InputTimeEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTimeEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTimeEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
