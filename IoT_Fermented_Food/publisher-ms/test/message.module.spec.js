const { getMessage } = require('../src/modules/message.module');

describe('Message module', () => {
    const microTemp = { ip: '1.2.3.4', measure: 'temperature', sensor: 'Grove - Temperature', username: 'user' };
    const microMoisture = { ip: '1.2.3.4', measure: 'humidity', sensor: 'Grove - Moisture', username: 'user' };
    const microLight = { ip: '1.2.3.4', measure: 'light', sensor: 'Grove - Light', username: 'user' };

    test('getMessage for temperature', () => {
        const data = { temperature: 500 };
        const msg = getMessage(data, microTemp);
        expect(msg.real_value).toBeDefined();
        expect(msg.digital_value).toBe(500);
        expect(msg.measure).toBe('temperature');
    });

    test('getMessage for moisture', () => {
        const data = { humidity: 500 };
        const msg = getMessage(data, microMoisture);
        expect(msg.real_value).toBeDefined();
        expect(msg.real_value).toBe(52.6); // 500 * 100 / 950 = 52.63
    });

    test('getMessage for light', () => {
        const data = { light: 500 };
        const msg = getMessage(data, microLight);
        expect(msg.real_value).toBeUndefined();
        expect(msg.digital_value).toBe(500);
    });

    test('getMessage for fake sensors', () => {
        const fakeTemp = { ...microTemp, sensor: 'Fake Grove - Temperature' };
        const fakeMoisture = { ...microMoisture, sensor: 'Fake Grove - Moisture' };

        expect(getMessage({ temperature: 500 }, fakeTemp).real_value).toBeDefined();
        expect(getMessage({ humidity: 500 }, fakeMoisture).real_value).toBe(52.6);
    });

    test('getMessage for unknown sensors defaults to digital', () => {
        const unknownSensor = { ...microTemp, sensor: 'Unknown Sensor' };
        expect(getMessage({ temperature: 500 }, unknownSensor).real_value).toBe(500);
    });
});
