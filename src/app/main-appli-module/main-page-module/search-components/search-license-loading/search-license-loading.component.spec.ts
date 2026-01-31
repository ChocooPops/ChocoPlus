import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLicenseLoadingComponent } from './search-license-loading.component';

describe('SearchLicenseLoadingComponent', () => {
  let component: SearchLicenseLoadingComponent;
  let fixture: ComponentFixture<SearchLicenseLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchLicenseLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchLicenseLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
