import { Component, OnInit, signal, computed } from '@angular/core';
import { ArduinoService } from '../../services/arduino.service';
import { Microcontroller } from '../../models/microcontroller.model';
import { ChartConfiguration, ChartData } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    PipesModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.less']
})
export class AnalyticsComponent implements OnInit {
  
  arduinos = toSignal(this.arduinoService.getMicrocontrollers(), { initialValue: [] });
  selectedDevices = signal<Microcontroller[]>([]);
  isLoading = signal(false);
  
  public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.7)' } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.5)' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'rgba(255, 255, 255, 0.5)' } }
    }
  };

  chartData = computed<ChartData<'line'>>(() => {
    const selected = this.selectedDevices();
    if (selected.length === 0) {
      return { labels: [], datasets: [] };
    }

    const datasets = selected.map((d, i) => ({
      data: [], // In a real scenario, this would be populated from a service based on selected devices
      label: `${d.ip} (${d.measure})`,
      borderColor: this.getColor(i),
      backgroundColor: this.getAlphaColor(i),
      fill: true,
      tension: 0.4
    }));

    return { labels: [], datasets };
  });

  constructor(private arduinoService: ArduinoService) { }

  ngOnInit(): void {
    // Initial fetch handled by toSignal
  }

  toggleDevice(device: Microcontroller): void {
    const current = this.selectedDevices();
    const index = current.findIndex(d => d.ip === device.ip && d.measure === device.measure);
    
    if (index > -1) {
      this.selectedDevices.update(list => list.filter((_, i) => i !== index));
    } else {
      this.selectedDevices.update(list => [...list, device]);
    }
  }

  private getColor(index: number): string {
    const colors = ['#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#6366f1'];
    return colors[index % colors.length];
  }

  private getAlphaColor(index: number): string {
    const colors = ['rgba(6, 182, 212, 0.1)', 'rgba(244, 63, 94, 0.1)', 'rgba(16, 185, 129, 0.1)'];
    return colors[index % colors.length];
  }
}
