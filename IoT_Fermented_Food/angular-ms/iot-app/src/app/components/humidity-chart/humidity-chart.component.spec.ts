import { async, fakeAsync, tick, discardPeriodicTasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { HumidityChartComponent } from './humidity-chart.component';
import { TestModule } from '@modules/test.module';
import { SocketService } from '@services/socket.service';
import { NotificationService } from '@services/notification.service';
import { ArduinoService } from '@services/arduino.service';
import { Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('HumidityChartComponent', () => {
  let component: HumidityChartComponent;
  let fixture: ComponentFixture<HumidityChartComponent>;
  let arduinoService: jasmine.SpyObj<ArduinoService>;
  let socketService: jasmine.SpyObj<SocketService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let measureUpdateSubject: Subject<any>;

  beforeEach(async(() => {
    measureUpdateSubject = new Subject();
    const arduinoSpy = jasmine.createSpyObj('ArduinoService', ['getCurrentMeasure']);
    const socketSpy = jasmine.createSpyObj('SocketService', [], { measureUpdate$: measureUpdateSubject.asObservable() });
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['notifyAlert']);

    TestBed.configureTestingModule({
      declarations: [HumidityChartComponent],
      imports: [TestModule],
      providers: [
        { provide: ArduinoService, useValue: arduinoSpy },
        { provide: SocketService, useValue: socketSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();

    arduinoService = TestBed.inject(ArduinoService) as jasmine.SpyObj<ArduinoService>;
    socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HumidityChartComponent);
    component = fixture.componentInstance;
    component.micro = {
      ip: '1.1.1.1',
      measure: 'humidity',
      sensor: 'DHT11',
      username: 'alice',
      isInactive: false,
      thresholdMax: 80,
      thresholdMin: 20
    };
  });

  it('should create and fetch initial measure', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.1.1.1', real_value: 45, date: new Date().toISOString() } as any));
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
    expect(component.lastHumidity).toBe(45);
    discardPeriodicTasks();
  }));

  it('should handle real-time updates', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.1.1.1', real_value: 45, date: new Date().toISOString() } as any));
    fixture.detectChanges();
    tick();

    const update = { measure: 'humidity', data: { ip: '1.1.1.1', real_value: 90, date: new Date().toISOString() } };
    measureUpdateSubject.next(update);
    tick();

    expect(notificationService.notifyAlert).toHaveBeenCalledWith('Humedad', 90, '%', 80, true);
    discardPeriodicTasks();
  }));

  it('should set inactivity if no measure found', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve(null as any));
    fixture.detectChanges();
    tick();
    expect(component.micro.isInactive).toBeTrue();
    discardPeriodicTasks();
  }));

  it('should handle drawData with no chart component', () => {
    component.chart.component = undefined;
    expect(() => component.drawData({ real_value: 50, date: new Date().toISOString() } as any)).not.toThrow();
  });

  it('should call chart.component.draw if exists', () => {
    const drawSpy = jasmine.createSpy('draw');
    component.chart.component = { draw: drawSpy } as any;
    component.drawData({ real_value: 50, date: new Date().toISOString() } as any);
    expect(drawSpy).toHaveBeenCalled();
  });
});
