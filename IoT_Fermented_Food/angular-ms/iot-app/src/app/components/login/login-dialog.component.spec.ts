import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { LoginDialogComponent } from './login-dialog.component';
import { AuthService } from '@services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LoginDialogComponent', () => {
    let component: LoginDialogComponent;
    let fixture: ComponentFixture<LoginDialogComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<LoginDialogComponent>>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['login']);
        const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
    declarations: [LoginDialogComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [ReactiveFormsModule],
    providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
            .compileComponents();

        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<LoginDialogComponent>>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form', () => {
        expect(component.loginForm).toBeDefined();
        expect(component.loginForm.controls['username']).toBeDefined();
        expect(component.loginForm.controls['password']).toBeDefined();
    });

    it('should close dialog on onNoClick', () => {
        component.onNoClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should change to register', () => {
        component.changeToRegister();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should handle successful login', () => {
        authServiceSpy.login.and.returnValue(of({ accessToken: 'test', refreshToken: 'test' }));
        component.login({ username: 'user', password: 'password' });

        expect(authServiceSpy.login).toHaveBeenCalledWith('user', 'password');
        expect(dialogRefSpy.close).toHaveBeenCalledWith('user');
    });

    it('should handle failed login', () => {
        authServiceSpy.login.and.returnValue(throwError({ status: 401 }));
        component.loginForm.controls['password'].setValue('wrongpassword');

        component.login({ username: 'user', password: 'wrongpassword' });

        expect(authServiceSpy.login).toHaveBeenCalledWith('user', 'wrongpassword');
        expect(component.loginForm.controls['password'].value).toBeNull();
    });
});
