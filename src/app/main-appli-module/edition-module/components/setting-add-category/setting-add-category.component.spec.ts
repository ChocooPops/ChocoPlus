import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAddCategoryComponent } from './setting-add-category.component';

describe('SettingAddCategoryComponent', () => {
  let component: SettingAddCategoryComponent;
  let fixture: ComponentFixture<SettingAddCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAddCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAddCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
