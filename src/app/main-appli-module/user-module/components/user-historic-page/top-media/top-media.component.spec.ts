import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopMediaComponent } from './top-media.component';

describe('TopMediaComponent', () => {
  let component: TopMediaComponent;
  let fixture: ComponentFixture<TopMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopMediaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
