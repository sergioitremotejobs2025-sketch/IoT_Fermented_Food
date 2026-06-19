import { Directive, OnInit } from '@angular/core'

import { Humidity } from '@models/humidity.model'
import { Temperature } from '@models/temperature.model'

export type SomeMeasures = Humidity | Temperature

@Directive()
export abstract class MeasureStats implements OnInit {

  avgMeasure = 0
  lastMeasure: SomeMeasures
  maxMeasure: SomeMeasures
  measureUnit: string
  minMeasure: SomeMeasures
  nSamples = 0

  constructor(measureUnit: string) {
    this.measureUnit = measureUnit
  }

  newMeasure(measure: any) {
    const values = measure.real_values || [measure.real_value || measure.digital_value];
    
    values.forEach((val: number) => {
      if (val === undefined || val === null) return;
      
      this.nSamples++
      this.avgMeasure = Number(
        ((this.avgMeasure * (this.nSamples - 1) + val) / this.nSamples).toFixed(1)
      )

      if (this.lastMeasure && this.maxMeasure && this.minMeasure) {
        const unifiedMeasure = { ...measure, real_value: val, date: measure.date || measure.end_date || measure.init_date };
        this.lastMeasure = unifiedMeasure;
        if (val > (this.maxMeasure as any).real_value) {
          this.maxMeasure = unifiedMeasure;
        }
        if (val < (this.minMeasure as any).real_value) {
          this.minMeasure = unifiedMeasure;
        }
      } else {
        const unifiedMeasure = { ...measure, real_value: val, date: measure.date || measure.end_date || measure.init_date };
        this.lastMeasure = unifiedMeasure;
        this.maxMeasure = unifiedMeasure;
        this.minMeasure = unifiedMeasure;
      }
    });
  }

  ngOnInit() { }

}
