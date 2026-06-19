import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AiService } from './ai.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AiService', () => {
    let service: AiService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
    imports: [],
    providers: [AiService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
        service = TestBed.inject(AiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call trainModel', () => {
        const ip = '1.2.3.4';
        const measure = 'temperature';
        const limit = 100;

        service.trainModel(ip, measure, limit).subscribe(res => {
            expect(res).toEqual({ status: 'ok' });
        });

        const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/ai/train`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ ip, measure, limit });
        req.flush({ status: 'ok' });
    });

    it('should call predict', () => {
        const ip = '1.2.3.4';
        const measure = 'temperature';
        const recentValues = [1, 2, 3];

        service.predict(ip, measure, recentValues).subscribe(res => {
            expect(res.prediction).toBe(4);
        });

        const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/ai/predict`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ ip, measure, recent_values: recentValues });
        req.flush({ prediction: 4 });
    });

    it('should call evaluate', () => {
        const ip = '1.2.3.4';
        const measure = 'temperature';

        service.evaluate(ip, measure).subscribe(res => {
            expect(res.mae).toBe(0.1);
        });

        const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/ai/evaluate`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ ip, measure });
        req.flush({ mae: 0.1, sample_count: 10 });
    });
});
