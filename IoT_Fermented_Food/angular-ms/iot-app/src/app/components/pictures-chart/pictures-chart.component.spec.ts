import { async, fakeAsync, tick, discardPeriodicTasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PicturesChartComponent } from './pictures-chart.component';
import { TestModule } from '@modules/test.module';
import { SocketService } from '@services/socket.service';
import { NotificationService } from '@services/notification.service';
import { ArduinoService } from '@services/arduino.service';

describe('PicturesChartComponent', () => {
    let component: PicturesChartComponent;
    let fixture: ComponentFixture<PicturesChartComponent>;
    let arduinoService: jasmine.SpyObj<ArduinoService>;
    let router: jasmine.SpyObj<Router>;
    let measureUpdateSubject: Subject<any>;

    beforeEach(async(() => {
        measureUpdateSubject = new Subject();
        const arduinoSpy = jasmine.createSpyObj('ArduinoService', ['getCurrentMeasure']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const socketSpy = jasmine.createSpyObj('SocketService', [], { measureUpdate$: measureUpdateSubject.asObservable() });
        const notificationSpy = jasmine.createSpyObj('NotificationService', ['notifyAlert']);

        TestBed.configureTestingModule({
            declarations: [PicturesChartComponent],
            imports: [TestModule],
            providers: [
                { provide: ArduinoService, useValue: arduinoSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SocketService, useValue: socketSpy },
                { provide: NotificationService, useValue: notificationSpy }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        arduinoService = TestBed.inject(ArduinoService) as jasmine.SpyObj<ArduinoService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PicturesChartComponent);
        component = fixture.componentInstance;
        component.micro = {
            ip: '1.2.3.4',
            measure: 'pictures',
            sensor: 'Camera',
            username: 'alice',
            isInactive: false
        };
    });

    it('should create and fetch initial pictures', fakeAsync(() => {
        const mockPic = { ip: '1.2.3.4', timestamp: 12345, url: 'http://some-url.com' };
        arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve(mockPic as any));

        fixture.detectChanges();
        tick();

        expect(component).toBeTruthy();
        expect(component.lastPicture()).toEqual(mockPic as any);
        expect(component.history().length).toBe(1);
        discardPeriodicTasks();
    }));

    it('should navigate to history', () => {
        component.goToHistory();
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard/history-pictures', '1.2.3.4']);
    });

    it('should handle real-time picture updates', fakeAsync(() => {
        const mockPic = { ip: '1.2.3.4', timestamp: 12345, url: 'http://some-url.com' };
        arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve(mockPic as any));

        fixture.detectChanges();
        tick();

        const newPic = { ip: '1.2.3.4', timestamp: 67890, url: 'http://new-url.com' };
        const update = { measure: 'pictures', data: newPic };
        measureUpdateSubject.next(update);
        tick();

        expect(component.lastPicture()).toEqual(newPic as any);
        expect(component.history().length).toBe(2);
        discardPeriodicTasks();
    }));

    it('should handle no measure with active micro', fakeAsync(() => {
        arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve(null));
        component.micro.isInactive = false;
        fixture.detectChanges();
        tick();

        expect(component.micro.isInactive).toBeTrue();
        discardPeriodicTasks();
    }));

    it('should pop history if greater than 10', () => {
        const mockPics = Array(10).fill(null).map((_, i) => ({ timestamp: i, url: '' } as any));
        component.history.set([...mockPics]);

        component.drawData({ timestamp: 99, url: '' } as any);

        expect(component.history().length).toBe(10);
        expect(component.history()[0].timestamp).toBe(99);
    });
    it('should select picture from history', () => {
        const pic1 = { timestamp: 1, url: 'url1' } as any;
        const pic2 = { timestamp: 2, url: 'url2' } as any;
        component.history.set([pic2, pic1]);
        
        component.selectFromHistory(1); // index 1 is pic1
        expect(component.selectedPicture()).toEqual(pic1);
    });
});
