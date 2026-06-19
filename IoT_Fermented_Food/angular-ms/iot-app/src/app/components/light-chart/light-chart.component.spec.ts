import { async, fakeAsync, tick, discardPeriodicTasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { LightChartComponent } from './light-chart.component';
import { TestModule } from '@modules/test.module';
import { SocketService } from '@services/socket.service';
import { NotificationService } from '@services/notification.service';
import { ArduinoService } from '@services/arduino.service';
import { Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LightChartComponent', () => {
  let component: LightChartComponent;
  let fixture: ComponentFixture<LightChartComponent>;
  let arduinoService: jasmine.SpyObj<ArduinoService>;
  let socketService: jasmine.SpyObj<SocketService>;
  let measureUpdateSubject: Subject<any>;

  beforeEach(async(() => {
    measureUpdateSubject = new Subject();
    const arduinoSpy = jasmine.createSpyObj('ArduinoService', ['getCurrentMeasure', 'postLightStatus']);
    const socketSpy = jasmine.createSpyObj('SocketService', [], { measureUpdate$: measureUpdateSubject.asObservable() });
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['notifyAlert']);

    TestBed.configureTestingModule({
      declarations: [LightChartComponent],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightChartComponent);
    component = fixture.componentInstance;
    component.micro = {
      ip: '1.2.3.4',
      measure: 'light',
      sensor: 'Photoresistor',
      username: 'alice',
      isInactive: false
    };
  });

  it('should create and fetch light status', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', digital_value: 1 } as any));
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
    expect(component.lightStatus()).toBe('on');
    expect(component.isLightOn()).toBeTrue();
    discardPeriodicTasks();
  }));

  it('should handle slide change', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', digital_value: 0 } as any));
    arduinoService.postLightStatus.and.returnValue(Promise.resolve({ ip: '1.2.3.4', digital_value: 1 } as any));

    fixture.detectChanges();
    tick();

    component.slideChange(true);
    tick(); // Wait for slideChange promise
    expect(arduinoService.postLightStatus).toHaveBeenCalledWith('1.2.3.4', 'on');
    expect(component.lightStatus()).toBe('on');
    discardPeriodicTasks();
  }));

  it('should handle real-time light updates', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', digital_value: 0 } as any));
    fixture.detectChanges();
    tick();

    const update = { measure: 'light', data: { ip: '1.2.3.4', digital_value: 1 } };
    measureUpdateSubject.next(update);
    tick();

    expect(component.lightStatus()).toBe('on');
    discardPeriodicTasks();
  }));

  it('should handle no measure with active micro', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve(null));
    component.micro.isInactive = false;
    fixture.detectChanges();
    tick();

    expect(component.micro.isInactive).toBeTrue();
    expect(component.lightStatus()).toBe('unknown');
    expect(component.disabledBtn()).toBeTrue();
    discardPeriodicTasks();
  }));

  it('should handle no measure with inactive micro', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve(null));
    component.micro.isInactive = true; // already inactive
    fixture.detectChanges();
    tick();

    // The setter is in superclass setInactivity. we just check the branch didn't alter it again incorrectly.
    expect(component.micro.isInactive).toBeTrue();
    discardPeriodicTasks();
  }));

  it('should handle slide change to false', fakeAsync(() => {
    arduinoService.getCurrentMeasure.and.returnValue(Promise.resolve({ ip: '1.2.3.4', digital_value: 1 } as any));
    arduinoService.postLightStatus.and.returnValue(Promise.resolve({ ip: '1.2.3.4', digital_value: 0 } as any));

    fixture.detectChanges();
    tick();

    component.slideChange(false);
    tick();
    expect(arduinoService.postLightStatus).toHaveBeenCalledWith('1.2.3.4', 'off');
    expect(component.lightStatus()).toBe('off');
    discardPeriodicTasks();
  }));
});
