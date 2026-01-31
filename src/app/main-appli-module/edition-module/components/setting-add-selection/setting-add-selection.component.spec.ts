import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAddSelectionComponent } from './setting-add-selection.component';

describe('SettingAddSelectionComponent', () => {
  let component: SettingAddSelectionComponent;
  let fixture: ComponentFixture<SettingAddSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAddSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAddSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
