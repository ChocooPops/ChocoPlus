import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNewVideoRunningComponent } from './edit-new-video-running.component';

describe('EditNewVideoRunningComponent', () => {
  let component: EditNewVideoRunningComponent;
  let fixture: ComponentFixture<EditNewVideoRunningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNewVideoRunningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditNewVideoRunningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
