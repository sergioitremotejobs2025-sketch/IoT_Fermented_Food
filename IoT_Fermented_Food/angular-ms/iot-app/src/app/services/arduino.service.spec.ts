import { TestBed } from '@angular/core/testing';
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

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArduinoService } from './arduino.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ArduinoService', () => {
  let service: ArduinoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [ArduinoService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ArduinoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get microcontrollers from API', () => {
    const mockMicrocontrollers = [
      { ip: '1.1.1.1', measure: 'humidity', sensor: 'DHT11', username: 'alice' }
    ];

    service.getMicrocontrollers().subscribe(micros => {
      expect(micros.length).toBe(1);
      expect(micros[0].ip).toBe('1.1.1.1');
    });

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/microcontrollers`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMicrocontrollers);
  });

  it('should post a microcontroller', () => {
    const mockMicro = { ip: '1.1.1.1', measure: 'humidity', sensor: 'DHT11', username: 'alice' };
    service.postMicrocontroller(mockMicro).subscribe();

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/microcontrollers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockMicro);
    req.flush({});
  });

  it('should delete a microcontroller', () => {
    const mockMicro = { ip: '1.1.1.1', measure: 'humidity', sensor: 'DHT11', username: 'alice' };
    service.deleteMicrocontroller(mockMicro).subscribe();

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/microcontrollers?ip=1.1.1.1&measure=humidity`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should get current measure', async () => {
    const mockMeasures = [{ ip: '1.1.1.1', value: 20 }];
    const promise = service.getCurrentMeasure('1.1.1.1', 'humidity');

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/humidity`);
    req.flush(mockMeasures);

    const result = await promise;
    expect(result.ip).toBe('1.1.1.1');
  });

  it('should post light status', async () => {
    const promise = service.postLightStatus('1.1.1.1', 'ON');

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/light`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ip: '1.1.1.1', status: 'ON' });
    req.flush({ ip: '1.1.1.1', sensor: 'Photoresistor' });

    const result = await promise;
    expect(result.ip).toBe('1.1.1.1');
  });

  it('should get a single microcontroller (uncached)', async () => {
    const mockMicros = [{ ip: '1.2.3.4', measure: 'temperature' }];
    const promise = service.getMicrocontroller('1.2.3.4', 'temperature');

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/microcontrollers`);
    req.flush(mockMicros);

    const result = await promise;
    expect(result.ip).toBe('1.2.3.4');
  });

  it('should get a single microcontroller (cached)', async () => {
    service.microcontrollers = [{ ip: '1.2.3.4', measure: 'temperature' } as any];
    const result = await service.getMicrocontroller('1.2.3.4', 'temperature');
    expect(result.ip).toBe('1.2.3.4');
  });

  it('should update a microcontroller', () => {
    const mockUpdate = { ip: '1.2.3.4', measure: 'temperature' };
    service.putMicrocontroller(mockUpdate).subscribe();

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/microcontrollers`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
    expect(service.microcontrollers.length).toBe(0);
  });

  it('should get previous measures', () => {
    service.getPreviousMeasures('1.2.3.4', 'temperature', 'day', '2023-01-01', '2023-01-02').subscribe();
    const req = httpMock.expectOne(request =>
      request.url === `${environment.ORCHESTRATOR_MS}/temperature` &&
      request.params.get('path') === 'day' &&
      request.params.get('ip') === '1.2.3.4'
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get pictures history', () => {
    service.getPicturesHistory('1.2.3.4', '2023-01-01', '2023-01-02').subscribe();
    const req = httpMock.expectOne(request =>
      request.url === `${environment.ORCHESTRATOR_MS}/pictures` &&
      request.params.get('path') === 'pictures/history'
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should clear microcontrollers', () => {
    service.microcontrollers = [{ ip: '1' } as any];
    service.clearMicrocontrollers();
    expect(service.microcontrollers.length).toBe(0);
  });

  it('should return cached microcontrollers if available', () => {
    service.microcontrollers = [{ ip: '1.1.1.1', measure: 'humidity' } as any];
    service.getMicrocontrollers().subscribe(micros => {
      expect(micros.length).toBe(1);
    });
    httpMock.expectNone(`${environment.ORCHESTRATOR_MS}/microcontrollers`);
  });

  it('should handle limit parameter in getPreviousMeasures', () => {
    service.getPreviousMeasures('1.2.3.4', 'temperature', 'day', null, null, 10).subscribe();
    const req = httpMock.expectOne(request =>
      request.url === `${environment.ORCHESTRATOR_MS}/temperature` &&
      request.params.get('limit') === '10'
    );
    req.flush([]);
  });

  it('should return null if no measure fits in getCurrentMeasure', async () => {
    const promise = service.getCurrentMeasure('1.2.3.4', 'humidity');
    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/humidity`);
    req.flush([{ ip: '1.1.1.1', value: 20 }]);
    const result = await promise;
    expect(result).toBeNull();
  });
});
