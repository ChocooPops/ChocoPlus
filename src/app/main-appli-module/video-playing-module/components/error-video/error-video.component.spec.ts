import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorVideoComponent } from './error-video.component';

describe('ErrorVideoComponent', () => {
  let component: ErrorVideoComponent;
  let fixture: ComponentFixture<ErrorVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
