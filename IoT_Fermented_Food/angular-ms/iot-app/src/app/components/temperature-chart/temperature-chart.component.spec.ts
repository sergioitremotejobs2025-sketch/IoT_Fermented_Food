import { async, fakeAsync, tick, discardPeriodicTasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { TemperatureChartComponent } from './temperature-chart.component';
import { TestModule } from '@modules/test.module';
import { SocketService } from '@services/socket.service';
import { NotificationService } from '@services/notification.service';
import { ArduinoService } from '@services/arduino.service';
import { Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('TemperatureChartComponent', () => {
  let component: TemperatureChartComponent;
  let fixture: ComponentFixture<TemperatureChartComponent>;
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
      declarations: [TemperatureChartComponent],
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
    socketService = TestBed.get(SocketService) as jasmine.SpyObj<SocketService>;
    notificationService = TestBed.get(NotificationService) as jasmine.SpyObj<NotificationService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemperatureChartComponent);
    component = fixture.componentInstance;
    component.micro = {
      ip: '1.2.3.4',
      measure: 'temperature',
      sensor: 'DHT11',
      username: 'alice',
      isInactive: false,
      thresholdMax: 30,
      thresholdMin: 15
    };
  });

  it('should create and fetch temperature', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', real_value: 22, date: new Date().toISOString() } as any));
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
    discardPeriodicTasks();
  }));

  it('should handle real-time temperature updates', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', real_value: 22, date: new Date().toISOString() } as any));
    fixture.detectChanges();
    tick();

    const update = { measure: 'temperature', data: { ip: '1.2.3.4', real_value: 35, date: new Date().toISOString() } };
    measureUpdateSubject.next(update);
    tick();

    expect(notificationService.notifyAlert).toHaveBeenCalledWith('Temperatura', 35, '°C', 30, true);
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

  it('should shift dataTable when H_AXIS_MAX is reached', () => {
    component.chart = { dataTable: [], component: { draw: jasmine.createSpy('draw') } } as any;
    component.header = ['Time', 'Value'];
    component.chart.dataTable = Array(11).fill(['Old Time', 10]); // H_AXIS_MAX + 1

    component.drawData({ date: new Date().toISOString(), real_value: 25 } as any);

    expect(component.chart.dataTable.length).toBe(11); // 11 - 2 (shift) + 1 (unshift) + 1 (push) = 11.
    expect(component.chart.dataTable[0]).toBe(component.header); // the unshifted header
    expect(component.chart.component.draw).toHaveBeenCalled();
  });

  it('should handle setInterval callback', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', real_value: 22, date: new Date().toISOString() } as any));
    fixture.detectChanges();
    tick(); // first call

    arduinoService.getCurrentMeasure.calls.reset();
    tick(31000); // interval
    expect(arduinoService.getCurrentMeasure).toHaveBeenCalled();

    discardPeriodicTasks();
  }));

  it('should set inactivity to false if micro is inactive and measure comes in via handleMeasure(false)', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', real_value: 22, date: new Date().toISOString() } as any));
    fixture.detectChanges();
    tick();

    component.micro.isInactive = true;
    component.handleMeasure({ ip: '1.2.3.4', real_value: 22, date: new Date().toISOString() } as any, false);

    expect(component.micro.isInactive).toBeFalse();
    discardPeriodicTasks();
  }));

  it('should notifyAlert on thresholdMin in handleMeasure', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', real_value: 22, date: new Date().toISOString() } as any));
    fixture.detectChanges();
    tick();

    component.handleMeasure({ ip: '1.2.3.4', real_value: 5, date: new Date().toISOString() } as any, false);

    expect(notificationService.notifyAlert).toHaveBeenCalledWith('Temperatura', 5, '°C', 15, false);
    discardPeriodicTasks();
  }));

  it('should return if micro or notificationService is not defined in checkThresholds', () => {
    const tempMicro = component.micro;
    component.micro = undefined;
    expect(() => component.checkThresholds(25)).not.toThrow();

    component.micro = tempMicro;
    const tempNotification = (component as any).notificationService;
    (component as any).notificationService = undefined;
    expect(() => component.checkThresholds(25)).not.toThrow();

    (component as any).notificationService = tempNotification;
  });

  it('should handle non-real_value in handleMeasure', () => {
    // cover digital_value branch
    const measure = { digital_value: 1 } as any;
    spyOn(component, 'drawData');
    component.handleMeasure(measure, false);
    expect(component.drawData).toHaveBeenCalled();
  });
});
