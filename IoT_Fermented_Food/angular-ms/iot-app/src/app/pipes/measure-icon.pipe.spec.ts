import { MeasureIconPipe } from './measure-icon.pipe';

describe('MeasureIconPipe', () => {
    let pipe: MeasureIconPipe;

    beforeEach(() => {
        pipe = new MeasureIconPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return correct icons for measures', () => {
        expect(pipe.transform('humidity')).toBe('opacity');
        expect(pipe.transform('light')).toBe('wb_sunny');
        expect(pipe.transform('temperature')).toBe('thermostat');
        expect(pipe.transform('pictures')).toBe('photo_camera');
    });

    it('should return default icon for unknown measures', () => {
        expect(pipe.transform('unknown')).toBe('sensors');
        expect(pipe.transform('')).toBe('sensors');
    });
});
