import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeLicenseComponent } from './home-license.component';

describe('DirectorButtonComponent', () => {
  let component: HomeLicenseComponent;
  let fixture: ComponentFixture<HomeLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLicenseComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomeLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
