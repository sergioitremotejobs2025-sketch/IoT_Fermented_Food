import 'src/test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvironmentSimulatorComponent } from './environment-simulator.component';
import { SimulationService } from 'src/app/services/simulation/simulation.service';
import { NotificationService } from 'src/app/services/notification.service';
import { of, throwError } from 'rxjs';
import { EnvironmentPattern } from 'src/app/models/simulation.model';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach, Mocked } from 'vitest';

describe('EnvironmentSimulatorComponent', () => {
  let component: EnvironmentSimulatorComponent;
  let fixture: ComponentFixture<EnvironmentSimulatorComponent>;
  let simulationServiceSpy: Mocked<SimulationService>;
  let notificationServiceSpy: Mocked<NotificationService>;
  
  beforeEach(async () => {
    simulationServiceSpy = {
      setEnvironmentPattern: vi.fn()
    } as unknown as Mocked<SimulationService>;

    notificationServiceSpy = {
      notify: vi.fn()
    } as unknown as Mocked<NotificationService>;

    await TestBed.configureTestingModule({
      imports: [
        EnvironmentSimulatorComponent, 
        MatSelectModule, 
        MatFormFieldModule, 
        MatButtonModule, 
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SimulationService, useValue: simulationServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Test 1: should trigger SimulationService.setEnvironmentPattern when applied', () => {
    simulationServiceSpy.setEnvironmentPattern.mockReturnValue(of({ status: 'success' }));
    
    component.selectedPattern = EnvironmentPattern.PH_CRASH;
    component.applyPattern();
    
    expect(simulationServiceSpy.setEnvironmentPattern).toHaveBeenCalledWith(EnvironmentPattern.PH_CRASH);
  });

  it('Test 2: should display success toast upon successful HTTP response', () => {
    simulationServiceSpy.setEnvironmentPattern.mockReturnValue(of({ status: 'success' }));
    
    component.selectedPattern = EnvironmentPattern.TEMP_SPIKE;
    component.applyPattern();
    
    expect(notificationServiceSpy.notify).toHaveBeenCalledWith('Simulation pattern updated successfully.', 'success');
  });

  it('Test 3: should display error toast upon failed HTTP response', () => {
    simulationServiceSpy.setEnvironmentPattern.mockReturnValue(throwError(() => new Error('Server error')));
    
    component.selectedPattern = EnvironmentPattern.STALLED;
    component.applyPattern();
    
    expect(notificationServiceSpy.notify).toHaveBeenCalledWith('Failed to update simulation pattern.', 'error');
  });
});
