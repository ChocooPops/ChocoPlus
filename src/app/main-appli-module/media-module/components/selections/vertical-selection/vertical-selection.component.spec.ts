import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalSelectionComponent } from './vertical-selection.component';

describe('NormalSelectionComponent', () => {
  let component: VerticalSelectionComponent;
  let fixture: ComponentFixture<VerticalSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalSelectionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VerticalSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
