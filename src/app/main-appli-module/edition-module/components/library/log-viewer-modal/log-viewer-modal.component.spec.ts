import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogViewerModalComponent } from './log-viewer-modal.component';

describe('LogViewerModalComponent', () => {
  let component: LogViewerModalComponent;
  let fixture: ComponentFixture<LogViewerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogViewerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogViewerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
