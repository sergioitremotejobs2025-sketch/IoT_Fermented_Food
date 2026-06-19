import { NgModule, Component, Input, Output, EventEmitter } from '@angular/core';

export interface GoogleChartInterface {
  chartType: string;
  dataTable: any[][];
  options?: any;
  component?: any;
}

@Component({
  selector: 'google-chart',
  template: '',
  standalone: true
})
export class GoogleChartComponent {
  @Input() data: any;
  @Output() chartReady = new EventEmitter();
  @Output() chartError = new EventEmitter();
  draw() {}
}

@NgModule({
  imports: [GoogleChartComponent],
  exports: [GoogleChartComponent]
})
export class Ng2GoogleChartsModule {}
