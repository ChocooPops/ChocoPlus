import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtClassicComponent } from './bt-classic.component';

describe('BtClassicComponent', () => {
  let component: BtClassicComponent;
  let fixture: ComponentFixture<BtClassicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtClassicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtClassicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
