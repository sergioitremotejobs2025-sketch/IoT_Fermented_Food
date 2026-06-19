import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LightStatsComponent } from './light-stats.component';
import { TestModule } from '@modules/test.module';

describe('LightStatsComponent', () => {
  let component: LightStatsComponent;
  let fixture: ComponentFixture<LightStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LightStatsComponent],
      imports: [TestModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update stats when newMeasure is called', () => {
    const t1 = 1000000;
    const t2 = 1060000; // 60s later
    const t3 = 1120000; // 60s later

    component.newMeasure({ timestamp: t1, digital_value: 1 } as any);
    expect(component.nSamples).toBe(1);
    expect(component.timeOn).toBe(0);
    expect(component.timeOff).toBe(0);

    component.newMeasure({ timestamp: t2, digital_value: 1 } as any);
    expect(component.nSamples).toBe(2);
    expect(component.timeOn).toBe(60);
    expect(component.timeOff).toBe(0);
    expect(component.percent).toBe(100);

    component.newMeasure({ timestamp: t3, digital_value: 0 } as any);
    expect(component.nSamples).toBe(3);
    expect(component.timeOn).toBe(60);
    expect(component.timeOff).toBe(60);
    expect(component.percent).toBe(50);
  });

  it('should format time correctly', () => {
    expect(component.formatTime(0)).toBe('0 h 0 min 0 s');
    expect(component.formatTime(65)).toBe('0 h 1 min 5 s');
    expect(component.formatTime(3665)).toBe('1 h 1 min 5 s');
  });
});
