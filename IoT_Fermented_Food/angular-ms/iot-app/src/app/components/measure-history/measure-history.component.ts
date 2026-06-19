import { Component, OnInit, signal, computed } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { forkJoin, of } from 'rxjs';

import { GoogleChartInterface } from 'ng2-google-charts'

import { ArduinoService } from '@services/arduino.service'

import { Microcontroller } from '@models/microcontroller.model'
import { MeasureStats } from '@alias/measure-stats.type'

import { MustBeOrderedDates } from '@helpers/must-be-ordered-dates.helper'

import { MeasureViewPipe } from '@pipes/measure-view.pipe'

interface Stat {
  color: string
  isSelected: boolean
  name: string
  value: 'min_value' | 'mean_value' | 'max_value'
}

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { PipesModule } from '@modules/pipes.module';

import { DashboardMicrocontrollerComponent } from '@components/dashboard-microcontroller/dashboard-microcontroller.component';

@Component({
  selector: 'app-measure-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule,
    FormsModule,
    Ng2GoogleChartsModule,
    PipesModule,
    DashboardMicrocontrollerComponent
  ],
  styleUrls: ['./measure-history.component.less'],
  templateUrl: './measure-history.component.html'
})
export class MeasureHistoryComponent implements OnInit {
  micro = signal<Microcontroller | undefined>(undefined)
  data = signal<MeasureStats[]>([])
  isLoading = signal<boolean>(true)

  header: string[] = []
  options = {
    colors: ['#3f51b5', '#e91e63', '#ffc107'],
    hAxis: {
      gridlines: { units: { days: { format: ['dd MMM'] }, hours: { format: ["HH 'h'"] } } },
      minorGridlines: { units: { hours: { format: ["HH 'h'"] } } },
      textStyle: { color: '#64748b' }
    },
    vAxis: {
      textStyle: { color: '#64748b' },
      gridlines: { color: 'rgba(0, 0, 0, 0.05)' }
    },
    legend: {
      alignment: 'end',
      position: 'top',
      textStyle: { color: '#1e293b' }
    },
    backgroundColor: 'transparent',
    chartArea: { width: '85%', height: '70%', top: 50 },
    explorer: {
      actions: ['dragToZoom', 'rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 4.0
    },
    curveType: 'function'
  }
  chart: GoogleChartInterface = {
    chartType: 'LineChart',
    dataTable: [],
    options: this.options
  }
  historyForm: FormGroup
  stat = 'Media'
  stats: Stat[] = [
    { color: '#3f51b5', isSelected: false, name: 'Mínimo', value: 'min_value' },
    { color: '#4caf50', isSelected: true, name: 'Media', value: 'mean_value' },
    { color: '#f44336', isSelected: false, name: 'Máximo', value: 'max_value' }
  ]
  currentStats = signal<string[]>(['mean_value']);
  isComparing = signal(false);

  constructor(
    private route: ActivatedRoute,
    private arduinoService: ArduinoService,
    private formBuilder: FormBuilder
  ) {
    this.historyForm = this.formBuilder.group(
      {
        init_date: [new Date(Date.now() - 24 * 60 * 60 * 1000), Validators.required],
        end_date: [new Date(), Validators.required],
        compare_init_date: [new Date(Date.now() - 48 * 60 * 60 * 1000)],
        compare_end_date: [new Date(Date.now() - 24 * 60 * 60 * 1000)],
        stats: ['Mean']
      },
      {
        validator: MustBeOrderedDates('init_date', 'end_date')
      }
    )
  }

  async ngOnInit() {
    const ip = this.route.snapshot.paramMap.get('ip')
    const measure = this.route.snapshot.paramMap.get('measure')

    if (!ip || !measure) return;

    try {
      const result = await this.arduinoService.getMicrocontroller(ip, measure)
      this.micro.set(result)
      this.header = ['Tiempo', new MeasureViewPipe().transform(result.measure)]
      this.chart.dataTable = [this.header, [new Date(), 0]]
      this.isLoading.set(false)
    } catch (error) {
      this.isLoading.set(false)
    }
  }

  setCurrentStats(values: string[]) {
    this.currentStats.set(values)
    this.selectChanged()
  }

  selectChanged() {
    const selected = this.currentStats();
    for (const stat of this.stats) {
      stat.isSelected = selected.includes(stat.value)
    }

    this.drawChart(this.data())
  }

  isOptionDisabled(micro: Microcontroller, stat: Stat): boolean {
    if (micro.measure === 'light' && stat.name !== 'Mean') return true
    return this.stats.filter(s => s.isSelected).length === 1 && stat.isSelected
  }

  getPreviousMeasures(formValue: { init_date: Date, end_date: Date, compare_init_date: Date, compare_end_date: Date }) {
    const { init_date, end_date, compare_init_date, compare_end_date } = formValue;
    const micro = this.micro();
    if (!micro) return;

    const obs1 = this.arduinoService.getPreviousMeasures(
      micro.ip,
      micro.measure,
      this.makePlural(micro.measure),
      init_date.toJSON(),
      end_date.toJSON()
    );

    const obs2 = this.isComparing() ? this.arduinoService.getPreviousMeasures(
      micro.ip,
      micro.measure,
      this.makePlural(micro.measure),
      compare_init_date.toJSON(),
      compare_end_date.toJSON()
    ) : of(null);

    forkJoin([obs1, obs2]).subscribe(([measures1, measures2]) => {
      this.data.set(measures1);
      this.drawChart(measures1, measures2);
      this.isLoading.set(false);
    });
  }

  makePlural(word: string) {
    const lastLetterIndex = word.length - 1
    return word[lastLetterIndex] !== 'y' ? `${word}s` : `${word.substring(0, lastLetterIndex)}ies`
  }

  drawChart(measures: MeasureStats[], compareMeasures: MeasureStats[] | null = null) {
    if (measures && measures.length) {
      const stats = this.stats.filter(stat => stat.isSelected)
      const names = stats.map(stat => stat.name)

      if (this.isComparing() && compareMeasures) {
        this.chart.dataTable = [['Punto', ...names.map(n => n + ' (P1)'), ...names.map(n => n + ' (P2)')]];
        this.options.colors = [...stats.map(s => s.color), ...stats.map(s => this.shadeColor(s.color, -30))];

        const count = Math.max(measures.length, compareMeasures.length);
        for (let i = 0; i < count; i++) {
          const row: (string | number | null)[] = [i + 1];
          stats.forEach(s => row.push(measures[i] ? (measures[i] as any)[s.value] : null));
          stats.forEach(s => row.push(compareMeasures[i] ? (compareMeasures[i] as any)[s.value] : null));
          this.chart.dataTable.push(row);
        }
      } else {
        this.chart.dataTable = [[this.header[0], ...names]]
        this.options.colors = stats.map(stat => stat.color)

        measures.forEach((measure) => {
          this.chart.dataTable.push([
            new Date(measure.init_date),
            ...stats.map(stat => (measure as any)[stat.value])
          ])
        })
      }

      this.chart.options = { ...this.options };
      if (this.chart.component) this.chart.component.draw()
    } else if (measures) {
      alert('¡No hay datos registrados!')
    }
  }

  shadeColor(color: string, percent: number) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.round((R * (100 + percent)) / 100);
    G = Math.round((G * (100 + percent)) / 100);
    B = Math.round((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    const RR = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
    const GG = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
    const BB = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

    return '#' + RR + GG + BB;
  }
}
