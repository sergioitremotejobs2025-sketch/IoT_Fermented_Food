import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { RegisterDialogComponent } from './register-dialog.component';
import { AuthService } from '@services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RegisterDialogComponent', () => {
    let component: RegisterDialogComponent;
    let fixture: ComponentFixture<RegisterDialogComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegisterDialogComponent>>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['register']);
        const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
    declarations: [RegisterDialogComponent],
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
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<RegisterDialogComponent>>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form', () => {
        expect(component.registerForm).toBeDefined();
        expect(component.registerForm.controls['username']).toBeDefined();
        expect(component.registerForm.controls['password']).toBeDefined();
        expect(component.registerForm.controls['repeatPassword']).toBeDefined();
    });

    it('should close dialog on onNoClick', () => {
        component.onNoClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should change to login', () => {
        component.changeToLogin();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    });

    it('should handle successful registration', () => {
        authServiceSpy.register.and.returnValue(of({ accessToken: 'test', refreshToken: 'test' }));
        component.register({ username: 'user', password: 'password', repeatPassword: 'password' });

        expect(authServiceSpy.register).toHaveBeenCalledWith('user', 'password');
        expect(dialogRefSpy.close).toHaveBeenCalledWith('user');
    });

    it('should handle failed registration', () => {
        authServiceSpy.register.and.returnValue(throwError({ status: 500 }));
        component.registerForm.controls['password'].setValue('password');
        component.registerForm.controls['repeatPassword'].setValue('password');

        component.register({ username: 'user', password: 'password', repeatPassword: 'password' });

        expect(authServiceSpy.register).toHaveBeenCalledWith('user', 'password');
        expect(component.registerForm.controls['password'].value).toBeNull();
        expect(component.registerForm.controls['repeatPassword'].value).toBeNull();
    });

    it('should reset passwords if they do not match on submit', () => {
        component.registerForm.controls['password'].setValue('password');
        component.registerForm.controls['repeatPassword'].setValue('wrong');

        component.register({ username: 'user', password: 'password', repeatPassword: 'wrong' });

        expect(authServiceSpy.register).not.toHaveBeenCalled();
        expect(component.registerForm.controls['password'].value).toBeNull();
        expect(component.registerForm.controls['repeatPassword'].value).toBeNull();
    });
});
