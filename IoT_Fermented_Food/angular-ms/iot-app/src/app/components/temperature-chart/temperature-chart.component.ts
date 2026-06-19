import { Component } from '@angular/core'

import { ArduinoService } from '@services/arduino.service'
import { SocketService } from '@services/socket.service'
import { NotificationService } from '@services/notification.service'

import { Temperature } from '@models/temperature.model'
import { MeasureChart } from '@shared/measure-chart.class'

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective
  ],
  styleUrls: ['./temperature-chart.component.less'],
  templateUrl: './temperature-chart.component.html'
})
export class TemperatureChartComponent extends MeasureChart {

  H_AXIS_MAX = 10

  constructor(
    private arduinoService: ArduinoService,
    protected override socketService: SocketService,
    protected override notificationService: NotificationService
  ) {
    super('Temperatura', 'line', socketService, notificationService)
    this.chartOptions = {
        ...this.chartOptions,
        scales: {
            ...this.chartOptions.scales,
            y: {
                ...this.chartOptions.scales.y,
            }
        }
    }
  }

  async getCurrentMeasure(isFirstTime: boolean) {
    const temperature = await this.arduinoService.getCurrentMeasure(this.micro.ip, this.micro.measure) as Temperature

    if (temperature) {
      this.handleMeasure(temperature, isFirstTime)
    } else if (!this.micro.isInactive) {
      this.setInactivity(true)
    }
  }

  drawData(temperature: Temperature) {
    if (this.chartData.labels.length >= this.H_AXIS_MAX) {
      this.chartData.labels.shift();
      this.chartData.datasets[0].data.shift();
    }

    this.chartData.labels.push(new Date(temperature.date).toLocaleTimeString());
    this.chartData.datasets[0].data.push(temperature.real_value);
    
    // Force Change Detection for ng2-charts by creating a new object reference
    this.chartData = {
      labels: [...this.chartData.labels],
      datasets: [
        {
          ...this.chartData.datasets[0],
          data: [...this.chartData.datasets[0].data]
        }
      ]
    };
  }

}
