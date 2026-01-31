import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyCategoryComponent } from './setting-modify-category.component';

describe('SettingModifyCategoryComponent', () => {
  let component: SettingModifyCategoryComponent;
  let fixture: ComponentFixture<SettingModifyCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
