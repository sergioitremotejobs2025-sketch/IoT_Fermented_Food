import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { AuthService } from '@services/auth.service';
import { of, throwError, Subject } from 'rxjs';
import { AuthResponse } from '@models/auth-response.model';

describe('TokenInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getAccessToken', 'refresh', 'announceLogIn']);

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        TokenInterceptor,
        { provide: AuthService, useValue: spy },
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should not add token for login or register', () => {
    httpClient.get('/api/login').subscribe();
    const req = httpMock.expectOne('/api/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should add token if available', () => {
    authServiceSpy.getAccessToken.and.returnValue('mock-token');

    httpClient.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush({});
  });

  it('should handle 401 and refresh token', () => {
    authServiceSpy.getAccessToken.and.returnValue('mock-token');
    authServiceSpy.refresh.and.returnValue(of({ accessToken: 'new-token', refreshToken: 'old-refresh' }));

    httpClient.get('/api/data').subscribe(res => {
      expect(res).toBeDefined();
    });

    // First request fails with 401
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Second request is sent with new token
    const retryReq = httpMock.expectOne('/api/data');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retryReq.flush({ success: true });
  });

  it('should handle 401 on refresh request', () => {
    authServiceSpy.getAccessToken.and.returnValue('mock-token');
    authServiceSpy.refresh.and.returnValue(throwError({ status: 401 }));

    httpClient.get('/api/refresh').subscribe(
      () => fail('Should have failed with 401 error'),
      (error) => {
        expect(error.status).toBe(401);
      }
    );

    // First request to refresh fails with 401
    const req = httpMock.expectOne('/api/refresh');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.announceLogIn).toHaveBeenCalledWith(false);
  });

  it('should throw error if not 401', () => {
    authServiceSpy.getAccessToken.and.returnValue('mock-token');

    httpClient.get('/api/data').subscribe(
      () => fail('Should have failed with 500 error'),
      (error) => {
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne('/api/data');
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should queue requests when refreshing', () => {
    const refreshSubject = new Subject<AuthResponse>();
    authServiceSpy.refresh.and.returnValue(refreshSubject);
    authServiceSpy.getAccessToken.and.returnValue('mock-token');

    httpClient.get('/api/request1').subscribe();
    httpClient.get('/api/request2').subscribe();

    const req1 = httpMock.expectOne('/api/request1');
    const req2 = httpMock.expectOne('/api/request2');

    // Both fail with 401
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    req2.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Refresh called once
    expect(authServiceSpy.refresh).toHaveBeenCalledTimes(1);

    // Emit new token
    refreshSubject.next({ accessToken: 'new-token' } as any);
    refreshSubject.complete();

    // Now both requests should be retried with new token
    const retry1 = httpMock.expectOne('/api/request1');
    const retry2 = httpMock.expectOne('/api/request2');

    expect(retry1.request.headers.get('Authorization')).toBe('Bearer new-token');
    expect(retry2.request.headers.get('Authorization')).toBe('Bearer new-token');

    retry1.flush({});
    retry2.flush({});
  });
});
