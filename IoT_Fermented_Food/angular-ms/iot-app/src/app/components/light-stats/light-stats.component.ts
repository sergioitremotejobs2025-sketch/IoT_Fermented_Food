import { Component, OnInit } from '@angular/core'

import { Light } from '@models/light.model'

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-light-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],
  styleUrls: [ './light-stats.component.less' ],
  templateUrl: './light-stats.component.html'
})
export class LightStatsComponent implements OnInit {

  nSamples = 0
  timeOn = 0
  timeOff = 0
  percent = 0
  lastTimestamp = 0
  elapsedTime = 0

  constructor() { }

  ngOnInit() { }

  newMeasure(light: Light) {
    this.nSamples++

    if (this.lastTimestamp) {
      const delta = Number(((light.timestamp - this.lastTimestamp) / 1000).toFixed())
      this.elapsedTime += delta

      if (light.digital_value) {
        this.timeOn += delta
      } else {
        this.timeOff += delta
      }

      this.percent = Number((this.timeOn * 100 / this.elapsedTime).toFixed(1))
    }

    this.lastTimestamp = light.timestamp
  }

  formatTime(seconds: number): string {
    let hours: number
    let minutes: number

    minutes = seconds < 60 ? 0 : Math.floor(seconds / 60)
    seconds -= minutes * 60

    hours = minutes < 60 ? 0 : Math.floor(minutes / 60)
    minutes -= hours * 60

    return `${hours} h ${minutes} min ${seconds} s`
  }

}
