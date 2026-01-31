import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionUserComponent } from './action-user.component';

describe('ActionUserComponent', () => {
  let component: ActionUserComponent;
  let fixture: ComponentFixture<ActionUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionUserComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ActionUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
