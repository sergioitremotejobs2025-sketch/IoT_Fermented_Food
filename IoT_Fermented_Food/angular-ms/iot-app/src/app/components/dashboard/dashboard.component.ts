import { Component, OnInit, signal, computed } from '@angular/core'
import { ActivatedRoute, UrlSegment } from '@angular/router'

import { ArduinoService } from '@services/arduino.service'
import { AuthService } from '@services/auth.service'

import { Microcontroller } from '@models/microcontroller.model'

import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { DashboardMicrocontrollerComponent } from '@components/dashboard-microcontroller/dashboard-microcontroller.component';
import { HumidityChartComponent } from '@components/humidity-chart/humidity-chart.component';
import { HumidityStatsComponent } from '@components/humidity-stats/humidity-stats.component';
import { LightChartComponent } from '@components/light-chart/light-chart.component';
import { LightStatsComponent } from '@components/light-stats/light-stats.component';
import { TemperatureChartComponent } from '@components/temperature-chart/temperature-chart.component';
import { TemperatureStatsComponent } from '@components/temperature-stats/temperature-stats.component';
import { PicturesChartComponent } from '@components/pictures-chart/pictures-chart.component';
import { AiPredictorComponent } from '@components/ai-predictor/ai-predictor.component';
import { ThreeDHoverDirective } from '../../shared/three-d-hover.directive';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { LottieAnimationComponent } from '../../shared/lottie-animation/lottie-animation.component';
import { PipesModule } from '@modules/pipes.module';
import { TimeHistoryChartComponent } from '@components/time-history-chart/time-history-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterModule,
    DashboardMicrocontrollerComponent,
    HumidityChartComponent,
    HumidityStatsComponent,
    LightChartComponent,
    LightStatsComponent,
    TemperatureChartComponent,
    TemperatureStatsComponent,
    PicturesChartComponent,
    AiPredictorComponent,
    ThreeDHoverDirective,
    SkeletonComponent,
    LottieAnimationComponent,
    PipesModule,
    TimeHistoryChartComponent
  ],
  styleUrls: ['./dashboard.component.less'],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  private microcontrollersSignal = signal<Microcontroller[]>([])
  private measureSignal = signal<string | undefined>(undefined)
  private isLoadingSignal = signal<boolean>(true)
  private recentValuesMapSignal = signal<Map<string, number[]>>(new Map())

  // Public computed/read-only signals
  microcontrollers = computed(() => {
    const micros = this.microcontrollersSignal()
    const measure = this.measureSignal()
    return measure ? micros.filter(m => m.measure === measure) : micros
  })
  isLoading = this.isLoadingSignal.asReadonly()
  measure = this.measureSignal.asReadonly()

  constructor(
    private route: ActivatedRoute,
    private arduinoService: ArduinoService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.route.url
      .subscribe((url: UrlSegment[]) => {
        const routeMeasure = url[1]?.path
        this.measureSignal.set(routeMeasure)

        this.isLoadingSignal.set(true)
        this.arduinoService.getMicrocontrollers()
          .subscribe(
            (response: Microcontroller[]) => {
              this.isLoadingSignal.set(false)
              const initializedMicros = response.map(m => ({ ...m, isInactive: false }))
              this.microcontrollersSignal.set(initializedMicros)

              initializedMicros.forEach(micro => {
                if (micro.measure !== 'pictures') {
                  this.seedRecentValues(micro)
                }
              })
            },
            () => {
              this.isLoadingSignal.set(false)
              this.authService.removeTokens()
            }
          )
      })
  }

  seedRecentValues(micro: Microcontroller) {
    const plural = micro.measure === 'light' ? 'lights' : micro.measure === 'temperature' ? 'temperatures' : 'humidities'
    this.arduinoService.getPreviousMeasures(micro.ip, micro.measure, plural, undefined, undefined, 20)
      .subscribe((history: any[]) => {
        const key = `${micro.ip}_${micro.measure}`
        const values = history.reverse().flatMap(h => h.real_values || [h.real_value])
        
        this.recentValuesMapSignal.update(map => {
            map.set(key, values.slice(-20))
            return new Map(map) // Trigger update via new reference
        })
      })
  }

  changeActivity(micro: Microcontroller) {
    this.microcontrollersSignal.update(micros => {
      const idx = micros.findIndex(m => m.ip === micro.ip && m.measure === micro.measure)
      if (idx !== -1) {
        micros[idx] = micro
      }
      return [...micros]
    })
  }

  updateRecentValues(micro: Microcontroller, measure: any) {
    const key = `${micro.ip}_${micro.measure}`
    this.recentValuesMapSignal.update(map => {
        const values = map.get(key) || []
        values.push(measure.real_value)
        if (values.length > 20) values.shift()
        map.set(key, values)
        return new Map(map)
    })
  }

  getRecentValues(micro: Microcontroller): number[] {
    return this.recentValuesMapSignal().get(`${micro.ip}_${micro.measure}`) || []
  }

}
