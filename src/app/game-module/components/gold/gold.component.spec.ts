import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldComponent } from './gold.component';

describe('GoldComponent', () => {
  let component: GoldComponent;
  let fixture: ComponentFixture<GoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
