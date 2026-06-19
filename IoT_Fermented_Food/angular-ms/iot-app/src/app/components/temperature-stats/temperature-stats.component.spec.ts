import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TemperatureStatsComponent } from './temperature-stats.component'
import { TestModule } from '@modules/test.module'
import { ArduinoService } from '@services/arduino.service'
import { ArduinoServiceStub } from '@stubs/arduino.service.stub'

describe('TemperatureStatsComponent', () => {
  let component: TemperatureStatsComponent
  let fixture: ComponentFixture<TemperatureStatsComponent>
  let arduinoService: ArduinoServiceStub

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TemperatureStatsComponent],
      imports: [TestModule],
      providers: [
        {
          provide: ArduinoService,
          useClass: ArduinoServiceStub
        }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TemperatureStatsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.measureUnit).toBe('ºC');
  });

  it('should update stats when newMeasure is called', () => {
    const measure1 = { real_value: 20 } as any;
    const measure2 = { real_value: 30 } as any;
    const measure3 = { real_value: 10 } as any;

    component.newMeasure(measure1);
    expect(component.nSamples).toBe(1);
    expect(component.avgMeasure).toBe(20);
    expect(component.lastMeasure.real_value).toBe(20);
    expect(component.maxMeasure.real_value).toBe(20);
    expect(component.minMeasure.real_value).toBe(20);

    component.newMeasure(measure2);
    expect(component.nSamples).toBe(2);
    expect(component.avgMeasure).toBe(25);
    expect(component.maxMeasure.real_value).toBe(30);
    expect(component.minMeasure.real_value).toBe(20);

    component.newMeasure(measure3);
    expect(component.avgMeasure).toBe(20);
    expect(component.maxMeasure.real_value).toBe(30);
    expect(component.minMeasure.real_value).toBe(10);
  });
});
