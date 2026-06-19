import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import '@analogjs/vitest-angular/setup-zone';
import 'zone.js/testing';

try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {}

import { DeviceHealthComponent } from './device-health.component';
import { ArduinoService } from '@services/arduino.service';
import { of } from 'rxjs';
import { MatModule } from '@modules/mat.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('DeviceHealthComponent', () => {
  let component: DeviceHealthComponent;
  let fixture: ComponentFixture<DeviceHealthComponent>;
  let arduinoServiceMock: any;

  beforeEach(async () => {
    arduinoServiceMock = {
      getMicrocontrollers: vi.fn().mockReturnValue(of([
        { ip: '1.2.3.4', sensor: 'DHT11', measure: 'humidity' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [DeviceHealthComponent, MatModule],
      providers: [
        { provide: ArduinoService, useValue: arduinoServiceMock },
        provideNoopAnimations()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate health stats using signals', () => {
    const micros = [
      { ip: '1.2.3.4', sensor: 'DHT11', measure: 'humidity' }
    ];
    component.calculateHealth(micros as any);
    expect(component.healthData().length).toBe(1);
    expect(component.healthData()[0].latency).toBeDefined();
  });

  it('should compute average uptime using a signal', () => {
    // RED PHASE: Expect averageUptime to be a computed signal
    component.healthData.set([
        { ip: '1', uptime: 100 } as any,
        { ip: '2', uptime: 50 } as any
    ]);
    expect(component.averageUptime()).toBe(75);
  });
});
