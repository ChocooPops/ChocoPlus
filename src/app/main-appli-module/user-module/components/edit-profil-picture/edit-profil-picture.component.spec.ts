import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfilPictureComponent } from './edit-profil-picture.component';

describe('EditProfilPictureComponent', () => {
  let component: EditProfilPictureComponent;
  let fixture: ComponentFixture<EditProfilPictureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfilPictureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfilPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
