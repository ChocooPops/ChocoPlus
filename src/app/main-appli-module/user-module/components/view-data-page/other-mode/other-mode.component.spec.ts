import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherModeComponent } from './other-mode.component';

describe('OterModeComponent', () => {
  let component: OtherModeComponent;
  let fixture: ComponentFixture<OtherModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherModeComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OtherModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
