import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputImageEditionComponent } from './input-image-edition.component';

describe('InputImageEditionComponent', () => {
  let component: InputImageEditionComponent;
  let fixture: ComponentFixture<InputImageEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputImageEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputImageEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
