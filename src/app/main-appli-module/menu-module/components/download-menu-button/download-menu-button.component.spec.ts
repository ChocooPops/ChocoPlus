import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadMenuButtonComponent } from './download-menu-button.component';

describe('DownloadMenuButtonComponent', () => {
  let component: DownloadMenuButtonComponent;
  let fixture: ComponentFixture<DownloadMenuButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadMenuButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
