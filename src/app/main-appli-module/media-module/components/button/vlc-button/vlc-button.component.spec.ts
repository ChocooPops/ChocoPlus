import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlcButtonComponent } from './vlc-button.component';

describe('VlcButtonComponent', () => {
  let component: VlcButtonComponent;
  let fixture: ComponentFixture<VlcButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlcButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlcButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
