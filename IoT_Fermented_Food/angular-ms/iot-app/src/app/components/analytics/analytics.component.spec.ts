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

import { AnalyticsComponent } from './analytics.component';
import { ArduinoService } from '../../services/arduino.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let arduinoServiceMock: any;

  beforeEach(async () => {
    arduinoServiceMock = {
      getMicrocontrollers: vi.fn().mockReturnValue(of([])),
      getPreviousMeasures: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent],
      providers: [
        { provide: ArduinoService, useValue: arduinoServiceMock },
        provideNoopAnimations()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load microcontrollers on init using signals', () => {
    expect(arduinoServiceMock.getMicrocontrollers).toHaveBeenCalled();
  });

  it('should toggle selection of a device using signals', () => {
    const dev = { ip: '1.2.3.4', measure: 'temp', name: 'Test' };
    component.toggleDevice(dev as any);
    // RED PHASE: Expect selectedDevices to be a signal
    expect(component.selectedDevices().length).toBe(1);
    
    component.toggleDevice(dev as any);
    expect(component.selectedDevices().length).toBe(0);
  });
});
