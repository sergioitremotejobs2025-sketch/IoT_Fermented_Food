import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { Subscription } from 'rxjs';

import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { Microcontroller } from '@models/microcontroller.model'
import { Measure } from '@alias/measure.type'
import { SocketService } from '@services/socket.service';
import { NotificationService } from '@services/notification.service';

@Directive()
export abstract class MeasureChart implements OnDestroy, OnInit {

  @Input() micro: Microcontroller
  @Output() inactivity = new EventEmitter<Microcontroller>()
  @Output() measure = new EventEmitter<Measure>()

  chartData: ChartData<any>
  chartOptions: ChartConfiguration<any>['options']
  chartType: ChartType = 'line'
  
  header: string[]
  interval: any
  isChartReady = false
  refresh_time = 30000 

  private socketSubscription: Subscription;

  constructor(
    measure: string,
    chartType: ChartType,
    protected socketService?: SocketService,
    protected notificationService?: NotificationService
  ) {
    this.header = ['Tiempo', measure]
    this.chartType = chartType
    this.chartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: measure,
          fill: true,
          tension: 0.4,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          pointRadius: 4,
          pointBackgroundColor: '#06b6d4'
        }
      ]
    }
    
    this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            },
            y: {
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { color: '#64748b' }
            }
        },
        plugins: {
            legend: {
                display: true,
                labels: { color: '#64748b' }
            }
        }
    }
  }

  checkInactivity() {
    if (this.micro && this.micro.isInactive) {
      this.setInactivity(false)
    }
  }

  checkThresholds(value: number) {
    if (!this.micro || !this.notificationService) return;

    const unit = this.micro.measure === 'temperature' ? '°C' : this.micro.measure === 'humidity' ? '%' : '';
    const label = this.micro.measure === 'temperature' ? 'Temperatura' : this.micro.measure === 'humidity' ? 'Humedad' : this.micro.measure;

    if (typeof this.micro.thresholdMax === 'number' && value > this.micro.thresholdMax) {
      this.notificationService.notifyAlert(label, value, unit, this.micro.thresholdMax, true);
    } else if (typeof this.micro.thresholdMin === 'number' && value < this.micro.thresholdMin) {
      this.notificationService.notifyAlert(label, value, unit, this.micro.thresholdMin, false);
    }
  }

  abstract drawData(measure: Measure): void

  abstract getCurrentMeasure(isFirstTime: boolean): Promise<void>

  handleMeasure(measure: Measure, isFirstTime: boolean) {
    this.drawData(measure)
    this.measure.emit(measure)

    // Check thresholds if it's a numeric value
    const numericValue = (measure as any).real_value ?? (measure as any).digital_value;
    if (typeof numericValue === 'number') {
      this.checkThresholds(numericValue);
    }

    if (isFirstTime) {
      this.interval = setInterval(() => this.getCurrentMeasure(false), this.refresh_time)
      this.isChartReady = true

      // Subscribe to real-time updates if socket service is available
      if (this.socketService) {
        this.socketSubscription = this.socketService.measureUpdate$.subscribe(update => {
          if ((update as any).measure === this.micro.measure && (update as any).ip === this.micro.ip) {
            console.log(`Real-time update received for ${this.micro.measure} at ${this.micro.ip}`);
            this.handleMeasure(update, false);
          }
        });
      }
    } else {
      this.checkInactivity()
    }
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval)
    if (this.socketSubscription) this.socketSubscription.unsubscribe();
  }

  async ngOnInit() {
    await this.getCurrentMeasure(true)
  }

  setInactivity(isInactive: boolean): void {
    if (this.micro) {
      this.micro.isInactive = isInactive
      this.inactivity.emit(this.micro)
    }
  }

}
