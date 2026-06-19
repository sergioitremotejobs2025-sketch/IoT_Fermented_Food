import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { MicrocontrollersComponent } from './microcontrollers.component';
import { ArduinoService } from '@services/arduino.service';
import { TestModule } from '@modules/test.module';

describe('MicrocontrollersComponent', () => {
  let component: MicrocontrollersComponent;
  let fixture: ComponentFixture<MicrocontrollersComponent>;
  let arduinoService: jasmine.SpyObj<ArduinoService>;

  beforeEach(async(() => {
    const arduinoSpy = jasmine.createSpyObj('ArduinoService', ['getMicrocontrollers', 'deleteMicrocontroller', 'clearMicrocontrollers']);

    TestBed.configureTestingModule({
      declarations: [MicrocontrollersComponent],
      imports: [
        TestModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ArduinoService, useValue: arduinoSpy }
      ]
    })
      .compileComponents();

    arduinoService = TestBed.inject(ArduinoService) as jasmine.SpyObj<ArduinoService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrocontrollersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    arduinoService.getMicrocontrollers.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load microcontrollers on init', () => {
    const mockMicros = [{ ip: '1.1.1.1', measure: 'humidity', sensor: 'DHT11', username: 'alice' }];
    arduinoService.getMicrocontrollers.and.returnValue(of(mockMicros));
    fixture.detectChanges();
    expect(component.microcontrollers.length).toBe(1);
  });

  it('should delete microcontroller', () => {
    const micro = { ip: '1.1.1.1', measure: 'humidity', sensor: 'DHT11', username: 'alice' };
    arduinoService.getMicrocontrollers.and.returnValue(of([micro]));
    arduinoService.deleteMicrocontroller.and.returnValue(of({}));

    fixture.detectChanges();
    component.deleteMicrocontroller(micro);

    expect(arduinoService.deleteMicrocontroller).toHaveBeenCalledWith(micro);
    expect(arduinoService.clearMicrocontrollers).toHaveBeenCalled();
  });
});
