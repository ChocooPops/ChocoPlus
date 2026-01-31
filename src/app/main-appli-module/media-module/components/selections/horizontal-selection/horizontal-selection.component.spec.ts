import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalSelectionComponent } from './horizontal-selection.component';

describe('HorizontalSelectionComponent', () => {
  let component: HorizontalSelectionComponent;
  let fixture: ComponentFixture<HorizontalSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
