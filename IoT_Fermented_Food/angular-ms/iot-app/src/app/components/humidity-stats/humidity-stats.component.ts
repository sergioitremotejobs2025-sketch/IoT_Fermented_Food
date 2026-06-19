import { Component } from '@angular/core'

import { MeasureStats } from '@shared/measure-stats.class'

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-humidity-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    PipesModule
  ],
  styleUrls: [ '../../templates/measure-stats.template.less' ],
  templateUrl: '../../templates/measure-stats.template.html'
})
export class HumidityStatsComponent extends MeasureStats {

  constructor() {
    super('%')
  }

}
