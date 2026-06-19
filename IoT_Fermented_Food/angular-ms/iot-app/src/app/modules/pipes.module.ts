import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { MeasureViewPipe } from '@pipes/measure-view.pipe'
import { MeasureIconPipe } from '@pipes/measure-icon.pipe'
import { TranslatePipe } from '@pipes/translate.pipe'

@NgModule({
  imports: [
    CommonModule,
    MeasureViewPipe,
    MeasureIconPipe,
    TranslatePipe
  ],
  exports: [
    MeasureViewPipe,
    MeasureIconPipe,
    TranslatePipe
  ]
})
export class PipesModule { }
