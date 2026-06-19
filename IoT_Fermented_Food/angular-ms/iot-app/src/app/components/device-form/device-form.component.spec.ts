import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceFormComponent } from './device-form.component';
import { ArduinoService } from '@services/arduino.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DeviceFormComponent', () => {
  let component: DeviceFormComponent;
  let fixture: ComponentFixture<DeviceFormComponent>;
  let arduinoServiceMock: any;

  beforeEach(async () => {
    arduinoServiceMock = {
      postMicrocontroller: jasmine.createSpy('postMicrocontroller').and.returnValue(of({ status: 'success' })),
      putMicrocontroller: jasmine.createSpy('putMicrocontroller').and.returnValue(of({ status: 'success' })),
      getMicrocontrollers: jasmine.createSpy('getMicrocontrollers').and.returnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [DeviceFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ArduinoService, useValue: arduinoServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.deviceForm.valid).toBeFalse();
  });

  it('should validate IP address format', () => {
    const ipControl = component.deviceForm.get('ip');
    ipControl?.setValue('invalid-ip');
    expect(ipControl?.hasError('pattern')).toBeTrue();
    
    ipControl?.setValue('192.168.1.1');
    expect(ipControl?.hasError('pattern')).toBeFalse();
  });

  it('should call postMicrocontroller on submit when in creation mode', () => {
    component.isEditMode = false;
    component.deviceForm.patchValue({
      ip: '192.168.1.100',
      measure: 'temperature',
      sensor: 'DHT22'
    });
    
    component.onSubmit();
    
    expect(arduinoServiceMock.postMicrocontroller).toHaveBeenCalledWith(jasmine.objectContaining({
      ip: '192.168.1.100',
      measure: 'temperature'
    }));
  });

  it('should handle 409 Conflict error', () => {
    arduinoServiceMock.postMicrocontroller.and.returnValue(throwError(() => ({ status: 409 })));
    
    component.deviceForm.patchValue({
      ip: '192.168.1.100',
      measure: 'temperature',
      sensor: 'DHT22'
    });
    
    component.onSubmit();
    expect(component.errorMessage).toContain('ya existe');
  });
});
