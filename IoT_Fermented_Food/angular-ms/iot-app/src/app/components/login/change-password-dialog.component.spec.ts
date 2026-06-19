import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { TestModule } from '@modules/test.module';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ChangePasswordDialogComponent', () => {
    let component: ChangePasswordDialogComponent;
    let fixture: ComponentFixture<ChangePasswordDialogComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ChangePasswordDialogComponent>>;

    beforeEach(async(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['changePassword']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['notify']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
    declarations: [ChangePasswordDialogComponent],
    imports: [TestModule],
    providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChangePasswordDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog when onNoClick is called', () => {
        component.onNoClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should notify success and close dialog on successful password change', () => {
        authServiceSpy.changePassword.and.returnValue(of({ success: true }));
        component.password = 'new-password';
        component.save();
        expect(notificationServiceSpy.notify).toHaveBeenCalledWith('Contraseña cambiada correctamente', 'success');
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should notify error on failed password change response', () => {
        authServiceSpy.changePassword.and.returnValue(of({ success: false }));
        component.save();
        expect(notificationServiceSpy.notify).toHaveBeenCalledWith('Error al cambiar la contraseña', 'error');
    });

    it('should notify server error on service failure', () => {
        authServiceSpy.changePassword.and.returnValue(throwError(() => new Error('Server error')));
        component.save();
        expect(notificationServiceSpy.notify).toHaveBeenCalledWith('Error en el servidor', 'error');
    });
});
