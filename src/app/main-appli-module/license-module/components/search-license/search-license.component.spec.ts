import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLicenseComponent } from './search-license.component';

describe('SearchLicenseComponent', () => {
  let component: SearchLicenseComponent;
  let fixture: ComponentFixture<SearchLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchLicenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
