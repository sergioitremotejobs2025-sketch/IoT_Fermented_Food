import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThresholdConfigComponent } from './threshold-config.component';
import { ThresholdService } from '@services/threshold.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ThresholdConfigComponent', () => {
  let component: ThresholdConfigComponent;
  let fixture: ComponentFixture<ThresholdConfigComponent>;
  let thresholdServiceMock: any;

  beforeEach(async () => {
    thresholdServiceMock = {
      updateThreshold: jasmine.createSpy('updateThreshold').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [ThresholdConfigComponent, ReactiveFormsModule],
      providers: [
        { provide: ThresholdService, useValue: thresholdServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ThresholdConfigComponent);
    component = fixture.componentInstance;
    component.threshold = { ip: '192.168.1.36', measure: 'temperature', min: 15, max: 30 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with threshold values', () => {
    expect(component.thresholdForm.value).toEqual({
      min: 15,
      max: 30
    });
  });

  it('should be invalid if min is greater than max', () => {
    component.thresholdForm.patchValue({ min: 40, max: 30 });
    expect(component.thresholdForm.invalid).toBeTrue();
    expect(component.thresholdForm.errors?.['minGreaterThanMax']).toBeTrue();
  });

  it('should be valid if min is less than max', () => {
    component.thresholdForm.patchValue({ min: 20, max: 30 });
    expect(component.thresholdForm.valid).toBeTrue();
  });

  it('should call updateThreshold when form is submitted', () => {
    component.thresholdForm.patchValue({ min: 18, max: 28 });
    component.onSubmit();
    
    expect(thresholdServiceMock.updateThreshold).toHaveBeenCalledWith({
      ip: '192.168.1.36',
      measure: 'temperature',
      min: 18,
      max: 28
    });
  });

  it('should handle error when updateThreshold fails', () => {
    thresholdServiceMock.updateThreshold.and.returnValue(throwError(() => ({ status: 400 })));
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Error al actualizar los umbrales. Verifique los datos.');
  });
});
