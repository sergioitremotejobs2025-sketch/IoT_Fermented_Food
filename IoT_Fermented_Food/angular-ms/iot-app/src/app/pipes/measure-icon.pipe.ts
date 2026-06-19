import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'measureIcon',
    standalone: true
})
export class MeasureIconPipe implements PipeTransform {
    transform(value: string): string {
        switch (value) {
            case 'temperature':
                return 'thermostat';
            case 'humidity':
                return 'opacity';
            case 'light':
                return 'wb_sunny';
            case 'pictures':
                return 'photo_camera';
            default:
                return 'sensors';
        }
    }
}
