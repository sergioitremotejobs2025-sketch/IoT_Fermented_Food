import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeasureService } from './measure.service';
import { environment } from 'src/environments/environment';

describe('MeasureService', () => {
  let service: MeasureService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MeasureService]
    });
    service = TestBed.inject(MeasureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHistory', () => {
    it('should call the correct endpoint with time range parameters', () => {
      const mockData = [{ date: '2026-04-20T10:00:00Z', value: 25.5 }];
      const ip = '192.168.1.36';
      const measure = 'temperature';
      const range = '24h';

      service.getHistory(ip, measure, range).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(request => 
        request.url === `${environment.ORCHESTRATOR_MS}/measures/history` &&
        request.params.get('ip') === ip &&
        request.params.get('measure') === measure &&
        request.params.get('range') === range
      );

      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });
});
