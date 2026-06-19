import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import '@analogjs/vitest-angular/setup-zone';

try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {}

import { DashboardComponent } from './dashboard.component';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { ArduinoService } from '@services/arduino.service';
import { AuthService } from '@services/auth.service';
import { SocketService } from '@services/socket.service';
import { NotificationService } from '@services/notification.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn(),
    setQuality: vi.fn()
  }
}));

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let arduinoService: any;
  let authService: any;
  let urlSubject: BehaviorSubject<UrlSegment[]>;

  beforeEach(async () => {
    arduinoService = {
      getMicrocontrollers: vi.fn(),
      getPreviousMeasures: vi.fn().mockReturnValue(of([])),
      getCurrentMeasure: vi.fn().mockReturnValue(Promise.resolve({}))
    };
    authService = {
      removeTokens: vi.fn()
    };
    const socketServiceMock = {
      on: vi.fn()
    };
    const notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    urlSubject = new BehaviorSubject<UrlSegment[]>([]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ArduinoService, useValue: arduinoService },
        { provide: AuthService, useValue: authService },
        { provide: SocketService, useValue: socketServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ActivatedRoute, useValue: { url: urlSubject.asObservable() } },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideLottieOptions({ player: () => player })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    arduinoService.getMicrocontrollers.mockReturnValue(of([]));
    arduinoService.getPreviousMeasures.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should filter microcontrollers by measure from URL', () => {
    const mockMicros = [
      { ip: '1.1.1.1', measure: 'humidity', sensor: 'DHT11', username: 'alice' },
      { ip: '2.2.2.2', measure: 'temperature', sensor: 'DHT11', username: 'alice' }
    ];
    arduinoService.getMicrocontrollers.mockReturnValue(of(mockMicros as any));
    arduinoService.getPreviousMeasures.mockReturnValue(of([]));

    fixture.detectChanges();
    expect(component.microcontrollers().length).toBe(2);

    // Simulate route change to 'humidity'
    urlSubject.next([
      new UrlSegment('measure', {}),
      new UrlSegment('humidity', {})
    ]);

    expect(component.measure()).toBe('humidity');
    expect(component.microcontrollers().length).toBe(1);
    expect(component.microcontrollers()[0].measure).toBe('humidity');
  });

  it('should call removeTokens on error', () => {
    arduinoService.getMicrocontrollers.mockReturnValue(throwError(() => 'Error'));
    arduinoService.getPreviousMeasures.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(authService.removeTokens).toHaveBeenCalled();
  });

  it('should update microcontroller in changeActivity', () => {
    const micro = { ip: '1.1.1.1', measure: 'humidity', sensor: 'DHT11', username: 'alice', isInactive: false };
    (component as any).microcontrollersSignal.set([micro]);
    const updatedMicro = { ...micro, isInactive: true };
    component.changeActivity(updatedMicro);
    expect(component.microcontrollers()[0].isInactive).toBe(true);
  });

  it('should seed recent values with different measures', () => {
    const mockMicros = [
      { ip: '1.2.3.4', measure: 'light', sensor: 'LDR', username: 'u' },
      { ip: '1.2.3.5', measure: 'temperature', sensor: 'DHT', username: 'u' },
      { ip: '1.2.3.6', measure: 'humidity', sensor: 'DHT', username: 'u' }
    ];
    arduinoService.getMicrocontrollers.mockReturnValue(of(mockMicros as any));
    arduinoService.getPreviousMeasures.mockReturnValue(of([{ real_value: 10 }] as any));

    fixture.detectChanges();

    expect(arduinoService.getPreviousMeasures).toHaveBeenCalledWith('1.2.3.4', 'light', 'lights', undefined, undefined, 20);
    expect(component.getRecentValues(mockMicros[0] as any)).toEqual([10]);
  });

  it('should handle updateRecentValues and sliding window', () => {
    const micro = { ip: 'i', measure: 'm' };

    // Initial update
    component.updateRecentValues(micro as any, { real_value: 5 });
    expect(component.getRecentValues(micro as any)).toEqual([5]);

    // Fill to > 20
    for (let i = 0; i < 25; i++) {
      component.updateRecentValues(micro as any, { real_value: i });
    }
    const values = component.getRecentValues(micro as any);
    expect(values.length).toBe(20);
    expect(values[19]).toBe(24);
  });

  it('should handle getRecentValues with missing key', () => {
    const micro = { ip: 'missing', measure: 'none' };
    expect(component.getRecentValues(micro as any)).toEqual([]);
  });
});
