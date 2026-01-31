import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionKeyComponent } from './action-key.component';

describe('ActionKeyComponent', () => {
  let component: ActionKeyComponent;
  let fixture: ComponentFixture<ActionKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionKeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
