import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDownloadButtonComponent } from './delete-download-button.component';

describe('DeleteDownloadButtonComponent', () => {
  let component: DeleteDownloadButtonComponent;
  let fixture: ComponentFixture<DeleteDownloadButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteDownloadButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteDownloadButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
