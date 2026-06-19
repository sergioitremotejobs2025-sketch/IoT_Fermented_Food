import { Component, signal } from '@angular/core'

import { ArduinoService } from '@services/arduino.service'
import { SocketService } from '@services/socket.service'
import { NotificationService } from '@services/notification.service'

import { Light } from '@models/light.model'

import { MeasureChart } from '@shared/measure-chart.class'

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SwitchComponent } from '../../shared/switch/switch.component'
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-light-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    SwitchComponent,
    PipesModule
  ],
  styleUrls: ['./light-chart.component.less'],
  templateUrl: './light-chart.component.html'
})
export class LightChartComponent extends MeasureChart {

  lightStatus = signal<string>('unknown')
  disabledBtn = signal<boolean>(true)

  constructor(
    private arduinoService: ArduinoService,
    protected override socketService: SocketService,
    protected override notificationService: NotificationService
  ) {
    super('Light', 'bar', socketService, notificationService)
  }

  async getCurrentMeasure(isFirstTime: boolean) {
    const light = await this.arduinoService.getCurrentMeasure(this.micro.ip, this.micro.measure) as Light

    if (light) {
      this.handleMeasure(light, isFirstTime)
    } else if (!this.micro.isInactive) {
      this.lightStatus.set('unknown')
      this.disabledBtn.set(true)
      this.setInactivity(true)
    }
  }

  drawData(light: Light) {
    this.disabledBtn.set(false)
    this.lightStatus.set(light.digital_value ? 'on' : 'off')
  }

  async slideChange(state: boolean) {
    this.disabledBtn.set(true)
    const light = await this.arduinoService.postLightStatus(this.micro.ip, state ? 'on' : 'off')
    this.lightStatus.set(light.digital_value ? 'on' : 'off')
    this.disabledBtn.set(false)
  }

  isLightOn(): boolean {
    return this.lightStatus() === 'on'
  }

}
