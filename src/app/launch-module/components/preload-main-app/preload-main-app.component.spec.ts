import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreloadMainAppComponent } from './preload-main-app.component';


describe('PreloadComponent', () => {
  let component: PreloadMainAppComponent;
  let fixture: ComponentFixture<PreloadMainAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreloadMainAppComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PreloadMainAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
