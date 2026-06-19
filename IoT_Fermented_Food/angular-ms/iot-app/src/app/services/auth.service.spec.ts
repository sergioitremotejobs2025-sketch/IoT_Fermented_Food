import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [AuthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set tokens', () => {
    const mockResponse = { accessToken: 'access', refreshToken: 'refresh' };
    service.login('user', 'pass').subscribe(res => {
      expect(res).toEqual(mockResponse);
      expect(localStorage.getItem('iot-ms-token')).toBe('access');
      expect(service.isLoggedIn()).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/login`);
    req.flush(mockResponse);
  });

  it('should register and set tokens', () => {
    const mockResponse = { accessToken: 'access', refreshToken: 'refresh' };
    service.register('user', 'pass').subscribe(res => {
      expect(res).toEqual(mockResponse);
      expect(localStorage.getItem('iot-ms-token')).toBe('access');
    });

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/register`);
    req.flush(mockResponse);
  });

  it('should remove tokens on logout', () => {
    localStorage.setItem('iot-ms-token', 'test');
    service.removeTokens();
    expect(localStorage.getItem('iot-ms-token')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should decode token and get user', () => {
    // Mock a valid JWT payload for 'user1'
    const payload = JSON.stringify({ username: 'user1', exp: 123, iat: 456 });
    // btoa might not handle all characters, but for this JSON it's fine
    const base64Payload = btoa(payload).replace(/=/g, '');
    const mockToken = `header.${base64Payload}.signature`;

    localStorage.setItem('iot-ms-token', mockToken);
    expect(service.getUser()).toBe('user1');
  });

  it('should handle refresh token', () => {
    localStorage.setItem('iot-ms-refresh-token', 'old_refresh');
    service.refresh().subscribe();

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/refresh`);
    expect(req.request.body).toEqual({ refreshToken: 'old_refresh' });
    req.flush({ accessToken: 'new_access', refreshToken: 'new_refresh' });
    expect(localStorage.getItem('iot-ms-token')).toBe('new_access');
  });

  it('should change password', () => {
    service.changePassword('new_pass').subscribe();
    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/change-password`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ password: 'new_pass' });
    req.flush({ success: true });
  });

  it('should handle login error', () => {
    service.login('user', 'pass').subscribe(
      () => { },
      () => {
        expect(service.isLoggedIn()).toBeFalse();
        expect(localStorage.getItem('iot-ms-token')).toBeNull();
      }
    );

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/login`);
    req.flush('Error', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle refresh error', () => {
    localStorage.setItem('iot-ms-refresh-token', 'bad_refresh');
    service.refresh().subscribe(
      () => { },
      () => {
        expect(localStorage.getItem('iot-ms-token')).toBeNull();
      }
    );

    const req = httpMock.expectOne(`${environment.ORCHESTRATOR_MS}/refresh`);
    req.flush('Error', { status: 401, statusText: 'Unauthorized' });
  });

  it('should return empty string if no token in getAccessUserFromToken', () => {
    localStorage.removeItem('iot-ms-token');
    expect(service.getAccessUserFromToken()).toBe('');
  });
});
