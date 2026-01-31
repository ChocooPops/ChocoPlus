import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InDevelopmentPageComponent } from './in-development-page.component';

describe('InDevelopmentPageComponent', () => {
  let component: InDevelopmentPageComponent;
  let fixture: ComponentFixture<InDevelopmentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InDevelopmentPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InDevelopmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
