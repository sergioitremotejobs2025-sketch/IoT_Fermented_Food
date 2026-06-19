import 'src/test-setup';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SimulationService } from './simulation.service';
import { environment } from 'src/environments/environment';
import { EnvironmentPattern } from 'src/app/models/simulation.model';

describe('SimulationService', () => {
  let service: SimulationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SimulationService]
    });
    service = TestBed.inject(SimulationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Test 1: should execute POST to /simulation/pattern when setEnvironmentPattern is called', () => {
    const pattern = EnvironmentPattern.TEMP_SPIKE;
    
    service.setEnvironmentPattern(pattern).subscribe(res => {
      expect(res.status).toBe('success');
    });

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/simulation/pattern`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ pattern });
    
    req.flush({ status: 'success' });
  });
});
