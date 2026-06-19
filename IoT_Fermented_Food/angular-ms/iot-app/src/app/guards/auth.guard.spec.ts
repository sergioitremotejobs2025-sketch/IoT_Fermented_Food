import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '@services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getRefreshToken', 'refresh', 'removeTokens']);

    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  const mockRoute = { url: [] } as any as ActivatedRouteSnapshot;
  const mockState = {} as any as RouterStateSnapshot;

  it('should return true if user is logged in', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    const result = await guard.canActivate(mockRoute, mockState);
    expect(result).toBeTrue();
  });

  it('should refresh token and return true if refresh token exists', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getRefreshToken.and.returnValue('valid-refresh-token');
    authServiceSpy.refresh.and.returnValue(of({ accessToken: 'a', refreshToken: 'b' }));

    const result = await guard.canActivate(mockRoute, mockState);
    expect(result).toBeTrue();
    expect(authServiceSpy.refresh).toHaveBeenCalled();
  });

  it('should remove tokens and return false if refresh fails', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getRefreshToken.and.returnValue('bad-token');
    authServiceSpy.refresh.and.returnValue(throwError(() => new Error('Refresh error')));

    const result = await guard.canActivate(mockRoute, mockState);
    expect(result).toBeFalse();
    expect(authServiceSpy.removeTokens).toHaveBeenCalled();
  });

  it('should return false if no credentials exist', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getRefreshToken.and.returnValue(null);

    const result = await guard.canActivate(mockRoute, mockState);
    expect(result).toBeFalse();
    expect(authServiceSpy.removeTokens).toHaveBeenCalled();
  });

  it('should get and set last URL', () => {
    const mockRouteWithUrl = {
      url: [{ path: 'test' }, { path: 'path' }]
    } as any as ActivatedRouteSnapshot;

    guard.setLastUrl(mockRouteWithUrl);
    expect(guard.getLastUrl()).toBe('/test/path');
  });

  it('should return default URL if lastUrl is not set', () => {
    expect(guard.getLastUrl()).toBe('/');
  });
});
