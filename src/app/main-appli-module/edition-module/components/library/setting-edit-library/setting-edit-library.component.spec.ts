import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingEditLibraryComponent } from './setting-edit-library.component';

describe('SettingEditLibraryComponent', () => {
  let component: SettingEditLibraryComponent;
  let fixture: ComponentFixture<SettingEditLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingEditLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingEditLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
