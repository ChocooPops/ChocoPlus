import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialSelectionComponent } from './special-selection.component';

describe('SpecialSelectionComponent', () => {
  let component: SpecialSelectionComponent;
  let fixture: ComponentFixture<SpecialSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
