import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { MeasureService, MeasureHistory } from '@services/measure.service';
import { Microcontroller } from '@models/microcontroller.model';
import { DataExportService } from '@services/data-export.service';

@Component({
  selector: 'app-time-history-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    BaseChartDirective
  ],
  templateUrl: './time-history-chart.component.html',
  styleUrls: ['./time-history-chart.component.less']
})
export class TimeHistoryChartComponent implements OnInit {
  @Input() micro!: Microcontroller;

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: '',
      fill: true,
      tension: 0.4,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      pointRadius: 2,
      pointBackgroundColor: '#06b6d4'
    }]
  };

  rawHistory: MeasureHistory[] = [];
  isExporting: boolean = false;

  chartOptions: ChartConfiguration<'line'>['options'] = {
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
  };

  selectedRange: string = '24h';

  constructor(
    private measureService: MeasureService,
    private exportService: DataExportService
  ) {}

  ngOnInit(): void {
    if (this.micro) {
      this.chartData.datasets[0].label = this.micro.measure === 'temperature' ? 'Temperatura' : 'Humedad';
      this.fetchHistory(this.selectedRange);
    }
  }

  onRangeChange(range: string): void {
    this.selectedRange = range;
    this.fetchHistory(range);
  }

  private fetchHistory(range: string): void {
    this.measureService.getHistory(this.micro.ip, this.micro.measure, range).subscribe(data => {
      this.rawHistory = data;
      this.updateChart(data);
    });
  }

  exportData(): void {
    if (this.rawHistory.length === 0) return;
    
    this.isExporting = true;
    const filename = `${this.micro.measure}_history_${this.micro.ip}_${this.selectedRange}.csv`;
    
    // Simulate a bit of processing delay to test the disabled state if needed, 
    // although it's usually instant for small datasets.
    setTimeout(() => {
      this.exportService.exportToCsv(this.rawHistory, filename);
      this.isExporting = false;
    }, 500);
  }

  private updateChart(history: MeasureHistory[]): void {
    const labels = history.map(h => new Date(h.date).toLocaleString());
    const data = history.map(h => h.value);

    this.chartData = {
      ...this.chartData,
      labels: labels,
      datasets: [{
        ...this.chartData.datasets[0],
        data: data
      }]
    };
  }
}
