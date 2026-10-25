import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpriteSelectionComponent } from './sprite-selection.component';

describe('SpriteSelectionComponent', () => {
  let component: SpriteSelectionComponent;
  let fixture: ComponentFixture<SpriteSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpriteSelectionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SpriteSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
