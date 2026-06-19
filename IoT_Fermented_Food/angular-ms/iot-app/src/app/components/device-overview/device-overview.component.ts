import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ArduinoService } from '@services/arduino.service';
import { Microcontroller } from '@models/microcontroller.model';

@Component({
  selector: 'app-device-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './device-overview.component.html',
  styleUrls: ['./device-overview.component.less']
})
export class DeviceOverviewComponent implements OnInit {
  
  devices = signal<Microcontroller[]>([]);
  searchQuery = '';
  
  displayedColumns: string[] = ['status', 'ip', 'measure', 'sensor', 'actions'];

  filteredDevices = computed(() => {
    const query = this.searchQuery.toLowerCase();
    const list = this.devices().filter(device => 
      device.ip.toLowerCase().includes(query) || 
      device.measure.toLowerCase().includes(query) ||
      device.sensor.toLowerCase().includes(query)
    );

    // Sort by status: Active (false) before Inactive (true)
    return list.sort((a, b) => (a.isInactive === b.isInactive) ? 0 : a.isInactive ? 1 : -1);
  });

  constructor(private arduinoService: ArduinoService) {}

  ngOnInit(): void {
    this.fetchDevices();
  }

  fetchDevices(): void {
    this.arduinoService.getMicrocontrollers().subscribe(data => {
      this.devices.set(data);
    });
  }

  getMeasureIcon(measure: string): string {
    switch (measure) {
      case 'temperature': return 'thermostat';
      case 'humidity': return 'water_drop';
      case 'light': return 'light_mode';
      case 'pictures': return 'camera_alt';
      default: return 'sensors';
    }
  }
}
