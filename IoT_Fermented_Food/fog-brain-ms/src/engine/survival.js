class SurvivalEngine {
    constructor() {}

    evaluate(payload) {
        if (payload.measure === 'temperature' && payload.value > 38) {
            return { triggered: true, action: 'cooling' };
        }
        if (payload.measure === 'pH' && payload.value > 95) {
            return { triggered: true, action: 'ventilation' };
        }
        return { triggered: false };
    }
}

module.exports = SurvivalEngine;
