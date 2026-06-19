import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HumidityStatsComponent } from './humidity-stats.component';
import { TestModule } from '@modules/test.module';

describe('HumidityStatsComponent', () => {
  let component: HumidityStatsComponent;
  let fixture: ComponentFixture<HumidityStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HumidityStatsComponent],
      imports: [TestModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HumidityStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.measureUnit).toBe('%');
  });

  it('should update stats when newMeasure is called', () => {
    const measure1 = { real_value: 50 } as any;
    const measure2 = { real_value: 60 } as any;
    const measure3 = { real_value: 40 } as any;

    component.newMeasure(measure1);
    expect(component.nSamples).toBe(1);
    expect(component.avgMeasure).toBe(50);
    expect(component.lastMeasure.real_value).toBe(50);
    expect(component.maxMeasure.real_value).toBe(50);
    expect(component.minMeasure.real_value).toBe(50);

    component.newMeasure(measure2);
    expect(component.nSamples).toBe(2);
    expect(component.avgMeasure).toBe(55);
    expect(component.maxMeasure.real_value).toBe(60);
    expect(component.minMeasure.real_value).toBe(50);

    component.newMeasure(measure3);
    expect(component.avgMeasure).toBe(50);
    expect(component.maxMeasure.real_value).toBe(60);
    expect(component.minMeasure.real_value).toBe(40);
  });
});
