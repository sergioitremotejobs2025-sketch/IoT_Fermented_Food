import { TestBed } from '@angular/core/testing';
import { AlertHistoryService, AlertEntry } from './alert-history.service';

describe('AlertHistoryService', () => {
    let service: AlertHistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AlertHistoryService);
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start with an empty history', () => {
        expect(service.getHistory().length).toBe(0);
    });

    it('should add an alert to history', () => {
        const alert: AlertEntry = {
            message: 'Test Alert',
            type: 'warning',
            timestamp: new Date()
        };
        service.addAlert(alert);
        const history = service.getHistory();
        expect(history.length).toBe(1);
        expect(history[0].message).toBe('Test Alert');
    });

    it('should persist alerts in localStorage', () => {
        const alert: AlertEntry = {
            message: 'Persistent Alert',
            type: 'error',
            timestamp: new Date()
        };
        service.addAlert(alert);
        
        // Re-inject service to simulate reload (in real app, we would just check localStorage)
        const saved = JSON.parse(localStorage.getItem('alert_history') || '[]');
        expect(saved.length).toBe(1);
        expect(saved[0].message).toBe('Persistent Alert');
    });

    it('should limit the history to 50 alerts', () => {
        for (let i = 0; i < 60; i++) {
            service.addAlert({
                message: `Alert ${i}`,
                type: 'success',
                timestamp: new Date()
            });
        }
        expect(service.getHistory().length).toBe(50);
        // Latest alert should be at index 0 (if we unshift) or last if we push.
        // Let's assume unshift (newest first)
        expect(service.getHistory()[0].message).toBe('Alert 59');
    });
});
