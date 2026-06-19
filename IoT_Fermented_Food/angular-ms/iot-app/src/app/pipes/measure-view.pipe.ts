import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'measureView',
  pure: false,
  standalone: true
})
export class MeasureViewPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return ''
    const measures: { name: string, view: string }[] = [
      { name: 'humidity', view: 'Humedad' },
      { name: 'light', view: 'Bombilla inteligente' },
      { name: 'temperature', view: 'Temperatura' },
      { name: 'pictures', view: 'Cámara' }
    ]

    const filtered = measures.filter(measure => measure.name === value)
    return filtered.length ? filtered[0].view : value
  }
}
