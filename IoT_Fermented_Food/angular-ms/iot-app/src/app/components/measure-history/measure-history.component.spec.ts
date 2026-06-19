import '@analogjs/vitest-angular/setup-zone';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {}

import { MeasureHistoryComponent } from './measure-history.component';
import { ArduinoService } from '@services/arduino.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { ComponentFixture } from '@angular/core/testing';

describe('MeasureHistoryComponent', () => {
  let component: MeasureHistoryComponent;
  let fixture: ComponentFixture<MeasureHistoryComponent>;
  let arduinoServiceMock: any;
  let routeMock: any;

  beforeEach(async () => {
    arduinoServiceMock = {
      getMicrocontroller: vi.fn(),
      getPreviousMeasures: vi.fn().mockReturnValue(of([]))
    };
    routeMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockImplementation((key) => {
            if (key === 'ip') return '1.2.3.4';
            if (key === 'measure') return 'temp';
            return null;
          })
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [MeasureHistoryComponent],
      providers: [
        { provide: ArduinoService, useValue: arduinoServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MeasureHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create and load microcontroller using signals', async () => {
    arduinoServiceMock.getMicrocontroller.mockResolvedValue({ ip: '1.2.3.4', measure: 'temp', sensor: 'Grove' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.micro().ip).toBe('1.2.3.4');
  });

  it('should load history data with strict typing', async () => {
    const mockMicro = { ip: '1.2.3.4', measure: 'temp', sensor: 'Grove' };
    component.micro.set(mockMicro as any);
    
    const mockMeasures = [
      { init_date: '2026-01-01', mean_value: 20 },
      { init_date: '2026-01-02', mean_value: 22 }
    ];
    arduinoServiceMock.getPreviousMeasures.mockReturnValue(of(mockMeasures));

    component.getPreviousMeasures(component.historyForm.value);
    
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.data().length).toBe(2);
    // Even if chart logic is skipped or partially failing, we care about the signal data
    expect(component.data().length).toBe(2);
  });
});
