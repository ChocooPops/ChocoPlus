import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchPageComponent } from './launch-page.component';

describe('LaunchPageComponent', () => {
  let component: LaunchPageComponent;
  let fixture: ComponentFixture<LaunchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaunchPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LaunchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
