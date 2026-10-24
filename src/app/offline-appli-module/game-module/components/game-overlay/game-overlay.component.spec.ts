import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOverlayComponent } from './game-overlay.component';

describe('GameOverlayComponent', () => {
  let component: GameOverlayComponent;
  let fixture: ComponentFixture<GameOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameOverlayComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GameOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
