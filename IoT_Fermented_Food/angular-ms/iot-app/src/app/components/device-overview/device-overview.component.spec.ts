import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceOverviewComponent } from './device-overview.component';
import { ArduinoService } from '@services/arduino.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('DeviceOverviewComponent', () => {
  let component: DeviceOverviewComponent;
  let fixture: ComponentFixture<DeviceOverviewComponent>;
  let arduinoServiceMock: any;

  beforeEach(async () => {
    const mockDevices = [
      { ip: '192.168.1.36', measure: 'temperature', sensor: 'DHT11', isInactive: false },
      { ip: '192.168.1.37', measure: 'humidity', sensor: 'DHT11', isInactive: true },
      { ip: '192.168.1.38', measure: 'light', sensor: 'LDR', isInactive: false }
    ];

    arduinoServiceMock = {
      getMicrocontrollers: jasmine.createSpy('getMicrocontrollers').and.returnValue(of(mockDevices)),
      allArduinos: of(mockDevices)
    };

    await TestBed.configureTestingModule({
      imports: [DeviceOverviewComponent, FormsModule],
      providers: [
        { provide: ArduinoService, useValue: arduinoServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all devices in the table', () => {
    const compiled = fixture.nativeElement;
    const rows = compiled.querySelectorAll('tr.device-row');
    expect(rows.length).toBe(3);
  });

  it('should filter devices by search query (IP)', () => {
    component.searchQuery = '1.38';
    fixture.detectChanges();
    const filtered = component.filteredDevices();
    expect(filtered.length).toBe(1);
    expect(filtered[0].ip).toBe('192.168.1.38');
  });

  it('should filter devices by search query (Measure)', () => {
    component.searchQuery = 'humidity';
    fixture.detectChanges();
    const filtered = component.filteredDevices();
    expect(filtered.length).toBe(1);
    expect(filtered[0].measure).toBe('humidity');
  });

  it('should sort devices by status', () => {
    // Default order: active first
    const sorted = component.filteredDevices();
    expect(sorted[0].isInactive).toBeFalse();
    expect(sorted[2].isInactive).toBeTrue();
  });
});
