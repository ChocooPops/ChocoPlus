import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLibraryComponent } from './new-library.component';

describe('NewLibraryComponent', () => {
  let component: NewLibraryComponent;
  let fixture: ComponentFixture<NewLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
