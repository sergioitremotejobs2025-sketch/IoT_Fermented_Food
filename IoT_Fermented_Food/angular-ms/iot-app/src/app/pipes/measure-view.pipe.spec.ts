import { MeasureViewPipe } from './measure-view.pipe';

describe('MeasureViewPipe', () => {
    let pipe: MeasureViewPipe;

    beforeEach(() => {
        pipe = new MeasureViewPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should transform "humidity" to "Humedad"', () => {
        expect(pipe.transform('humidity')).toBe('Humedad');
    });

    it('should transform "light" to "Bombilla inteligente"', () => {
        expect(pipe.transform('light')).toBe('Bombilla inteligente');
    });

    it('should transform "temperature" to "Temperatura"', () => {
        expect(pipe.transform('temperature')).toBe('Temperatura');
    });

    it('should transform "pictures" to "Cámara"', () => {
        expect(pipe.transform('pictures')).toBe('Cámara');
    });

    it('should return original value if not found', () => {
        expect(pipe.transform('other')).toBe('other');
    });

    it('should return empty string for null/undefined', () => {
        expect(pipe.transform(null as any)).toBe('');
        expect(pipe.transform('')).toBe('');
    });
});
