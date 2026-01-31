import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CutoffButtonComponent } from './cutoff-button.component';

describe('CutoffButtonComponent', () => {
  let component: CutoffButtonComponent;
  let fixture: ComponentFixture<CutoffButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CutoffButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CutoffButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
