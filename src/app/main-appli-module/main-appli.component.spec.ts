import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAppliComponent } from './main-appli.component';

describe('MainAppliComponent', () => {
  let component: MainAppliComponent;
  let fixture: ComponentFixture<MainAppliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainAppliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainAppliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
