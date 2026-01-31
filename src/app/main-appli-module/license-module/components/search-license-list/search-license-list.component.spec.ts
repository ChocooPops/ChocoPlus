import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLicenseListComponent } from './search-license-list.component';

describe('SearchLicenseListComponent', () => {
  let component: SearchLicenseListComponent;
  let fixture: ComponentFixture<SearchLicenseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchLicenseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchLicenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
