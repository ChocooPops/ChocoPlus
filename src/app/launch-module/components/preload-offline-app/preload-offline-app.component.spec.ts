import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreloadOfflineAppComponent } from './preload-offline-app.component';

describe('PreloadOfflineAppComponent', () => {
  let component: PreloadOfflineAppComponent;
  let fixture: ComponentFixture<PreloadOfflineAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreloadOfflineAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreloadOfflineAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
