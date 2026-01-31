import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtQualityComponent } from './bt-quality.component';

describe('BtQualityComponent', () => {
  let component: BtQualityComponent;
  let fixture: ComponentFixture<BtQualityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtQualityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
