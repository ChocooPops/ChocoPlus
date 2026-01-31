import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeLicenseListComponent } from './home-license-list.component';

describe('DirectorListComponent', () => {
  let component: HomeLicenseListComponent;
  let fixture: ComponentFixture<HomeLicenseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLicenseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeLicenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
