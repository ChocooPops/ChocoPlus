import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalGridComponent } from './vertical-grid.component';

describe('VerticalGridComponent', () => {
  let component: VerticalGridComponent;
  let fixture: ComponentFixture<VerticalGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
