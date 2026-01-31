import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtFullscreenComponent } from './bt-fullscreen.component';

describe('BtFullscreenComponent', () => {
  let component: BtFullscreenComponent;
  let fixture: ComponentFixture<BtFullscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtFullscreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtFullscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
