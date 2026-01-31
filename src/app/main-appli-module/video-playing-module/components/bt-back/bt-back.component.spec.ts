import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtBackComponent } from './bt-back.component';

describe('BackButtonComponent', () => {
  let component: BtBackComponent;
  let fixture: ComponentFixture<BtBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtBackComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BtBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
