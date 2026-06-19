import { MeasureStats, SomeMeasures } from './measure-stats.class';

class ConcreteMeasureStats extends MeasureStats {
    constructor(unit: string) {
        super(unit);
    }
}

describe('MeasureStats', () => {
    let stats: ConcreteMeasureStats;

    beforeEach(() => {
        stats = new ConcreteMeasureStats('%');
    });

    it('should initialize with correct unit', () => {
        expect(stats.measureUnit).toBe('%');
        expect(stats.nSamples).toBe(0);
        expect(stats.avgMeasure).toBe(0);
    });

    it('should handle first measure correctly', () => {
        const measure: SomeMeasures = { real_value: 20 } as any;
        stats.newMeasure(measure);

        expect(stats.nSamples).toBe(1);
        expect(stats.avgMeasure).toBe(20);
        // Use toEqual for object deep comparison and verify properties added by unifiedMeasure
        expect(stats.lastMeasure).toEqual(jasmine.objectContaining({ real_value: 20 }));
        expect(stats.maxMeasure).toEqual(jasmine.objectContaining({ real_value: 20 }));
        expect(stats.minMeasure).toEqual(jasmine.objectContaining({ real_value: 20 }));
    });

    it('should update stats correctly with multiple measures', () => {
        stats.newMeasure({ real_value: 10 } as any);
        stats.newMeasure({ real_value: 30 } as any);
        stats.newMeasure({ real_value: 20 } as any);

        expect(stats.nSamples).toBe(3);
        expect(stats.avgMeasure).toBe(20);
        expect(stats.maxMeasure.real_value).toBe(30);
        expect(stats.minMeasure.real_value).toBe(10);
        expect(stats.lastMeasure.real_value).toBe(20);
    });

    it('should handle decimal rounding', () => {
        stats.newMeasure({ real_value: 10 } as any);
        stats.newMeasure({ real_value: 11 } as any);
        // (10 + 11) / 2 = 10.5

        expect(stats.avgMeasure).toBe(10.5);
    });

    it('should skip null or undefined values', () => {
        stats.newMeasure({ real_value: 10 } as any);
        stats.newMeasure({ real_value: null } as any);
        stats.newMeasure({ real_value: undefined } as any);

        expect(stats.nSamples).toBe(1);
        expect(stats.avgMeasure).toBe(10);
    });
});
