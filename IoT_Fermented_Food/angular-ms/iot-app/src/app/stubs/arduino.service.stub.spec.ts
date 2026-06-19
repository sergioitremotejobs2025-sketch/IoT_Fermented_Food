import { TestBed } from '@angular/core/testing';
import { ArduinoServiceStub } from './arduino.service.stub';

describe('ArduinoServiceStub', () => {
    let service: ArduinoServiceStub;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ArduinoServiceStub);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get a value', () => {
        expect(service.getValue()).toBe('real value');
    });

    it('should get microcontrollers', () => {
        service.getMicrocontrollers().subscribe(micros => {
            expect(micros.length).toBeGreaterThan(0);
        });
        service.microcontrollers = [{ ip: 'test', measure: 'test' } as any];
        service.getMicrocontrollers().subscribe(micros => {
            expect(micros.length).toBe(1);
        });
    });

    it('should get microcontroller', async () => {
        service.microcontrollers = [{ ip: 'test', measure: 'test' } as any];
        const micro = await service.getMicrocontroller('test', 'test');
        expect(micro).toBeDefined();

        service.microcontrollers = [];
        const micro2 = await service.getMicrocontroller('1.2.3.4', 'test');
        expect(micro2).toBeUndefined(); // mock logic
    });

    it('should get current temperatures', () => {
        service.getCurrentTemperatures('temp').subscribe(res => {
            expect(res).toBeDefined();
        });
    });

    it('should get current temperature', async () => {
        const temp = await service.getCurrentTemperature('1.2.3.4', 'temp');
        expect(temp).toBeUndefined(); // mock logic doesn't match 1.2.3.4
    });

    it('should perform other stub methods', async () => {
        service.postMicrocontroller({} as any).subscribe(res => expect(res).toBeDefined());
        service.deleteMicrocontroller({} as any).subscribe(res => expect(res).toBeDefined());
        service.putMicrocontroller({}).subscribe(res => expect(res).toBeDefined());
        service.clearMicrocontrollers();
        expect(service.microcontrollers.length).toBe(0);

        const measure = await service.getCurrentMeasure('ip', 'measure');
        expect(measure.ip).toBe('ip');

        const status = await service.postLightStatus('ip', 'status');
        expect(status.ip).toBe('ip');

        service.getPreviousMeasures('', '', '', '', '').subscribe(res => expect(res).toBeDefined());
        service.getPicturesHistory('', '', '').subscribe(res => expect(res).toBeDefined());
        service.getPreviousTemperatures('', '', '').subscribe(res => expect(res).toBeDefined());
    });
});
