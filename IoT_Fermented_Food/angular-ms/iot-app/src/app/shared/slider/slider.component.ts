import { Component, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatSliderModule } from '@angular/material/slider'

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, MatSliderModule],
  template: `
    <mat-slider [min]="min()" [max]="max()" [step]="step()" discrete>
      <input matSliderThumb (valueChange)="valueChange.emit($event)" [value]="value()">
    </mat-slider>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    mat-slider {
      width: 100%;
    }
  `]
})
export class SliderComponent {
  min = input<number>(0)
  max = input<number>(100)
  step = input<number>(1)
  value = input<number>(0)
  valueChange = output<number>()
}
