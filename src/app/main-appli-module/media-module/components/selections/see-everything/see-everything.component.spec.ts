import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeEverythingComponent } from './see-everything.component';

describe('SeeEverythingComponent', () => {
  let component: SeeEverythingComponent;
  let fixture: ComponentFixture<SeeEverythingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeEverythingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeeEverythingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
