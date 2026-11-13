import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterAppliOfflineComponent } from './parameter-appli-offline.component';

describe('ParameterAppliOfflineComponent', () => {
  let component: ParameterAppliOfflineComponent;
  let fixture: ComponentFixture<ParameterAppliOfflineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParameterAppliOfflineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParameterAppliOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
