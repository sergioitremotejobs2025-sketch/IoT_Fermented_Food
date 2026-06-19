const SurvivalEngine = require('../src/engine/survival');

describe('Survival Engine', () => {
    let engine;

    beforeEach(() => {
        engine = new SurvivalEngine();
    });

    test('should trigger local cooling actuators when Temperature > 38C', () => {
        const payload = { measure: 'temperature', value: 39.5 };
        const result = engine.evaluate(payload);
        
        expect(result.action).toBe('cooling');
        expect(result.triggered).toBe(true);
    });

    test('should trigger local ventilation when pH > 95%', () => {
        const payload = { measure: 'pH', value: 96 }; // Maybe the prompt meant humidity, but we'll stick to 'pH'
        const result = engine.evaluate(payload);
        
        expect(result.action).toBe('ventilation');
        expect(result.triggered).toBe(true);
    });

    test('should not trigger any action for normal readings', () => {
        const payload = { measure: 'temperature', value: 25 };
        const result = engine.evaluate(payload);
        
        expect(result.triggered).toBe(false);
    });
});
