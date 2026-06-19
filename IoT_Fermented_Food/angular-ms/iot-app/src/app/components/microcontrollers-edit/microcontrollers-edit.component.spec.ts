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

import { MicrocontrollersEditComponent } from './microcontrollers-edit.component';
import { ArduinoService } from '@services/arduino.service';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ActivatedRoute } from '@angular/router';

describe('MicrocontrollersEditComponent', () => {
  let component: MicrocontrollersEditComponent;
  let fixture: ComponentFixture<MicrocontrollersEditComponent>;
  let arduinoServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let routeMock: any;

  beforeEach(async () => {
    arduinoServiceMock = {
      getMicrocontroller: vi.fn().mockResolvedValue({ ip: '1.2.3.4', measure: 'temp', sensor: 'Grove' }),
      putMicrocontroller: vi.fn().mockReturnValue(of({})),
      postMicrocontroller: vi.fn().mockReturnValue(of({})),
      clearMicrocontrollers: vi.fn()
    };
    authServiceMock = {
      getUser: vi.fn().mockReturnValue('test-user')
    };
    routerMock = {
      navigate: vi.fn()
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
      imports: [MicrocontrollersEditComponent],
      providers: [
        { provide: ArduinoService, useValue: arduinoServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MicrocontrollersEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in edit mode using signals', () => {
    expect(component).toBeTruthy();
    // RED PHASE: Expect isEdit to be a signal
    expect(component.isEdit()).toBe(true);
  });

  it('should compute available sensors using a signal', () => {
    // RED PHASE: Expect availableSensors to be a computed signal
    component.measureForm.setValue({ measure: 'humidity' });
    expect(component.availableSensors().length).toBeGreaterThan(0);
    expect(component.availableSensors()).toContain('Grove - Moisture');
  });
});
