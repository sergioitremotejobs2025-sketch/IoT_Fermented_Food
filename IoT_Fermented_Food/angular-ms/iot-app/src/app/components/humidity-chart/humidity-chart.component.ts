import { Component } from '@angular/core'

import { ArduinoService } from '@services/arduino.service'
import { SocketService } from '@services/socket.service'
import { NotificationService } from '@services/notification.service'

import { Humidity } from '@models/humidity.model'
import { MeasureChart } from '@shared/measure-chart.class'

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-humidity-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    BaseChartDirective
  ],
  styleUrls: ['./humidity-chart.component.less'],
  templateUrl: './humidity-chart.component.html'
})
export class HumidityChartComponent extends MeasureChart {

  lastHumidity = -1
  displayedColumns: string[] = ['status', 'min', 'max']
  dataSource: { status: string, min: number, max: number }[] = [
    { status: 'Seco', min: 0.0, max: 31.6 },
    { status: 'Húmedo', min: 31.6, max: 73.7 },
    { status: 'Mojado', min: 73.7, max: 100.0 }
  ]

  constructor(
    private arduinoService: ArduinoService,
    protected override socketService: SocketService,
    protected override notificationService: NotificationService
  ) {
    super('Humedad', 'doughnut', socketService, notificationService)
    this.chartOptions = {
      ...this.chartOptions,
      cutout: '80%',
      scales: {
        x: { display: false },
        y: { display: false }
      },
      plugins: {
        ...this.chartOptions.plugins,
        legend: { display: false }
      }
    }
  }

  async getCurrentMeasure(isFirstTime: boolean) {
    const humidity = await this.arduinoService.getCurrentMeasure(this.micro.ip, this.micro.measure) as Humidity

    if (humidity) {
      this.handleMeasure(humidity, isFirstTime)
    } else if (!this.micro.isInactive) {
      this.setInactivity(true)
    }
  }

  drawData(humidity: Humidity) {
    this.lastHumidity = humidity.real_value
    
    // Doughnut as Gauge: [value, 100 - value]
    this.chartData = {
      labels: [this.header[1], 'Restante'],
      datasets: [{
        data: [humidity.real_value, Math.max(0, 100 - humidity.real_value)],
        backgroundColor: [this.getHumidityColor(humidity.real_value), 'rgba(255, 255, 255, 0.05)'],
        borderWidth: 0
      }]
    }
  }

  private getHumidityColor(value: number): string {
    if (value < 31.6) return '#ef4444' // Red (Dry)
    if (value < 73.7) return '#06b6d4' // Cyan (Humid)
    return '#3b82f6' // Blue (Wet)
  }

}
