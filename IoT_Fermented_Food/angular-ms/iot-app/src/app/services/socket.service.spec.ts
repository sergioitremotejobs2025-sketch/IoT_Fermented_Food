import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketService]
        });
        service = TestBed.inject(SocketService);
    });

    it('should be created and connect to socket', () => {
        expect(service).toBeTruthy();
        expect((service as any).socket).toBeDefined();
    });

    it('should emit events', () => {
        spyOn((service as any).socket, 'emit');
        service.emit('test_event', { key: 'val' });
        expect((service as any).socket.emit).toHaveBeenCalledWith('test_event', { key: 'val' });
    });

    it('should handle incoming measure updates', () => {
        service.measureUpdate$.subscribe(data => {
            expect(data).toBe('mock_data');
        });
        const callbacks = (service as any).socket._callbacks;
        const fn = callbacks['$measure_update'][0];
        fn('mock_data');
    });

    it('should handle connect event', () => {
        spyOn(console, 'log');
        const callbacks = (service as any).socket._callbacks;
        const fn = callbacks['$connect'][0];
        fn();
        expect(console.log).toHaveBeenCalledWith('Connected to Orchestrator via WebSockets');
    });
});
