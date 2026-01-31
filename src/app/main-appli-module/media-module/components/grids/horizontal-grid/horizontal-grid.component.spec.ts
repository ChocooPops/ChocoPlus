import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalGridComponent } from './horizontal-grid.component';

describe('HorizontalGridComponent', () => {
  let component: HorizontalGridComponent;
  let fixture: ComponentFixture<HorizontalGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
