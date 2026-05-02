import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadVersionComponent } from './bad-version.component';

describe('BadVersionComponent', () => {
  let component: BadVersionComponent;
  let fixture: ComponentFixture<BadVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadVersionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BadVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
