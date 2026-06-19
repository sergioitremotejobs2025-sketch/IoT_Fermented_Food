import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '@services/auth.service';
import { AuthGuard } from '@guards/auth.guard';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let authGuardSpy: jasmine.SpyObj<AuthGuard>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let logInAnnouncedSubject: Subject<boolean>;

  beforeEach(async () => {
    logInAnnouncedSubject = new Subject<boolean>();
    const authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'removeTokens'], { logInAnnounced$: logInAnnouncedSubject.asObservable() });
    const guardSpy = jasmine.createSpyObj('AuthGuard', ['getLastUrl']);
    const dSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [MatMenuModule, MatIconModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: AuthGuard, useValue: guardSpy },
        { provide: MatDialog, useValue: dSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authGuardSpy = TestBed.inject(AuthGuard) as jasmine.SpyObj<AuthGuard>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(routerSpy, 'navigateByUrl');
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and subscribe to auth updates', () => {
    authServiceSpy.getUser.and.returnValue('alice');
    fixture.detectChanges(); // triggers ngOnInit

    expect(component.username).toBe('alice');
    expect(component.isLogged).toBeTrue();
  });

  it('should handle logInAnnounced$ true', () => {
    authServiceSpy.getUser.and.returnValue('alice');
    authGuardSpy.getLastUrl.and.returnValue('/dashboard');
    fixture.detectChanges();

    logInAnnouncedSubject.next(true);

    expect(component.isLogged).toBeTrue();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle logInAnnounced$ false', () => {
    authServiceSpy.getUser.and.returnValue('');
    fixture.detectChanges();

    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(undefined));
    dialogSpy.open.and.returnValue(mockDialogRef);

    logInAnnouncedSubject.next(false);

    expect(component.isLogged).toBeFalse();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should update icon on menu toggle', () => {
    component.menuOpened();
    expect(component.icon).toBe('keyboard_arrow_up');

    component.menuClosed();
    expect(component.icon).toBe('keyboard_arrow_down');
  });

  it('should handle logout', () => {
    component.username = 'alice';
    component.logout();

    expect(component.icon).toBe('keyboard_arrow_down');
    expect(authServiceSpy.removeTokens).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
    expect(component.username).toBe('');
  });

  describe('subscription callback', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle undefined (dialog closed without action)', () => {
      component.isDialogOpen = true;
      component.isLogged = false;
      component.subscription(undefined);

      expect(component.isDialogOpen).toBeFalse();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should handle string (username from successful login/register)', () => {
      component.isDialogOpen = true;
      component.subscription('alice_new');

      expect(component.username).toBe('alice_new');
      expect(component.isLogged).toBeTrue();
      expect(component.isDialogOpen).toBeFalse();
    });

    it('should handle boolean (switching dialogs)', () => {
      const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      mockDialogRef.afterClosed.and.returnValue(new Subject<any>().asObservable());
      dialogSpy.open.and.returnValue(mockDialogRef);

      component.subscription(true);
      expect(component.isDialogOpen).toBeTrue();
      expect(dialogSpy.open).toHaveBeenCalled();

      component.subscription(false);
      expect(dialogSpy.open).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle unsubscribe on destroy', () => {
    fixture.detectChanges();
    spyOn(component.subs, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subs.unsubscribe).toHaveBeenCalled();
  });

  it('should open change password dialog', () => {
    component.openChangePasswordDialog();
    expect(dialogSpy.open).toHaveBeenCalled();
  });
});
