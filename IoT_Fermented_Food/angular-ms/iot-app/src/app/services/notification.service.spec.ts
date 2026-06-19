import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';
import { AlertHistoryService } from './alert-history.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let alertHistorySpy: jasmine.SpyObj<AlertHistoryService>;

    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        alertHistorySpy = jasmine.createSpyObj('AlertHistoryService', ['addAlert', 'getHistory']);
        
        TestBed.configureTestingModule({
            providers: [
                NotificationService,
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: AlertHistoryService, useValue: alertHistorySpy }
            ]
        });
        service = TestBed.inject(NotificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call snackBar.open and alertHistory.addAlert on notify', () => {
        service.notify('Test message', 'success');
        expect(snackBarSpy.open).toHaveBeenCalledWith('Test message', 'Cerrar', jasmine.any(Object));
        expect(alertHistorySpy.addAlert).toHaveBeenCalledWith(jasmine.objectContaining({
            message: 'Test message',
            type: 'success'
        }));
    });

    it('should call notify on notifyAlert', () => {
        const spy = spyOn(service, 'notify').and.callThrough();
        service.notifyAlert('Temp', 30, 'C', 25, true);
        expect(spy).toHaveBeenCalledWith(
            'ALERTA: Temp (30C) es superior al umbral de 25C',
            'warning'
        );
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should show "inferior" direction on alert when isAbove is false', () => {
        const spy = spyOn(service, 'notify').and.callThrough();
        service.notifyAlert('Temp', 20, 'C', 25, false);
        expect(spy).toHaveBeenCalledWith(
            'ALERTA: Temp (20C) es inferior al umbral de 25C',
            'warning'
        );
    });

    it('should use "success" type as default in notify', () => {
        service.notify('Generic message');
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            'Generic message',
            'Cerrar',
            jasmine.objectContaining({ panelClass: ['snackbar-success'] })
        );
    });

    it('should add to activeNotifications and auto-dismiss', fakeAsync(() => {
        service.notify('Temporary notification');
        expect(service.activeNotifications().length).toBe(1);
        expect(service.activeNotifications()[0].message).toBe('Temporary notification');

        tick(5000);
        expect(service.activeNotifications().length).toBe(0);
    }));

    it('should allow manual dismissal', () => {
        service.notify('Manual dismiss');
        const id = service.activeNotifications()[0].id;
        service.dismiss(id);
        expect(service.activeNotifications().length).toBe(0);
    });
});
