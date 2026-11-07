import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadedMediaPageComponent } from './downloaded-media-page.component';

describe('DownloadedMediaPageComponent', () => {
  let component: DownloadedMediaPageComponent;
  let fixture: ComponentFixture<DownloadedMediaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadedMediaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadedMediaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
