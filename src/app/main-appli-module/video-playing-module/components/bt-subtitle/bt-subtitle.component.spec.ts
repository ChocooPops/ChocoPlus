import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtSubtitleComponent } from './bt-subtitle.component';

describe('BtSubtitleComponent', () => {
  let component: BtSubtitleComponent;
  let fixture: ComponentFixture<BtSubtitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtSubtitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtSubtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
