const request = require('supertest');
const app = require('../src/app/app');

// Helper to calculate digital value from desired real value for testing
const realTempToDigital = (celsius) => {
  const B_TERMISTOR = 4275;
  const T0 = 298.15;
  const kelvin = celsius + 273.15;
  const ln_val = B_TERMISTOR * (1 / kelvin - 1 / T0);
  const digital = 1023 / (Math.exp(ln_val) + 1);
  return Math.round(digital);
}

const realPhToDigital = (ph) => Math.round(ph * 1023 / 14);

describe('Fake Fermentation Controller', () => {

  describe('POST /pattern', () => {
    
    beforeEach(async () => {
      // Reset pattern state to default before each test
      await request(app).post('/pattern').send({ pattern: 'steady' });
    });

    it('Test 1: Assert that sending { "pattern": "ph-crash" } returns 200 OK', async () => {
      const res = await request(app)
        .post('/pattern')
        .send({ pattern: 'ph-crash' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ status: 'success', pattern: 'ph-crash' });
    });

    it('Test 2: Assert after setting ph-crash, GET /temperature returns warm range (20-25°C)', async () => {
      await request(app).post('/pattern').send({ pattern: 'ph-crash' });
      const res = await request(app).get('/temperature');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('temperature');
      
      // With noise, 20-25 could go slightly below 20 or above 25.
      const minDigital = realTempToDigital(30); // Note: higher temp is lower digital usually (NTC thermistor)
      const maxDigital = realTempToDigital(15); 
      
      // NTC thermistor: higher temp -> lower resistance -> lower voltage drop -> higher or lower digital depending on wiring.
      // Based on equation: celsius=25 -> kelvin=298.15 -> ln_val=0 -> exp=1 -> digital=511.5
      // celsius=35 -> kelvin=308.15 -> ln_val = 4275*(1/308.15 - 1/298.15) = 4275*(-0.000108) = -0.46
      // exp(-0.46) = 0.63. digital = 1023 / 1.63 = 627.
      // So higher temp = higher digital.
      
      const lowerBound = realTempToDigital(15); // ~370
      const upperBound = realTempToDigital(30); // ~570
      
      expect(res.body.temperature).toBeGreaterThan(lowerBound);
      expect(res.body.temperature).toBeLessThan(upperBound);
    });

    it('Test 3: Assert after setting ph-crash, GET /ph returns low pH range (3.0-3.5)', async () => {
      await request(app).post('/pattern').send({ pattern: 'ph-crash' });
      const res = await request(app).get('/ph');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ph');
      
      // Allow for noise
      const lowerBound = realPhToDigital(2.5);
      const upperBound = realPhToDigital(4.0);
      
      expect(res.body.ph).toBeGreaterThan(lowerBound);
      expect(res.body.ph).toBeLessThan(upperBound);
    });

    it('Test 4: Assert unknown pattern returns 400 Bad Request', async () => {
      const res = await request(app)
        .post('/pattern')
        .send({ pattern: 'unknown_phase' });
      
      expect(res.statusCode).toEqual(400);
    });

  });

});
