const request = require('supertest');
const app = require('../src/app/app');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Mock axios
jest.mock('axios');

describe('Simulation Proxy Endpoints', () => {
  let token;

  beforeAll(() => {
    // Generate a valid mock token since the routes are protected by jwtMiddleware
    token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET || 'token_secret', { expiresIn: '1h' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Test 1: Assert POST /simulation/pattern triggers axios.post to fake sensor IPs', async () => {
    axios.get.mockResolvedValue({
      data: [
        { ip: 'fake-fermentation-1:3000' },
        { ip: 'fake-fermentation-2:3001' },
        { ip: 'real-sensor-1:80' }
      ]
    });
    
    axios.post.mockResolvedValue({ data: { status: 'success' } });

    const res = await request(app)
      .post('/simulation/pattern')
      .set('Authorization', `Bearer ${token}`)
      .send({ pattern: 'ph-crash' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'success' });
    
    // Assert axios.post was called to the fake sensors
    expect(axios.post).toHaveBeenCalledWith('http://fake-fermentation-1:3000/pattern', { pattern: 'ph-crash' });
    expect(axios.post).toHaveBeenCalledWith('http://fake-fermentation-2:3001/pattern', { pattern: 'ph-crash' });
    // Should NOT have been called on real-sensor
    expect(axios.post).not.toHaveBeenCalledWith('http://real-sensor-1:80/pattern', { pattern: 'ph-crash' });
  });

  it('Test 2: Assert returns 500 if the internal requests fail', async () => {
    axios.get.mockResolvedValue({
      data: [
        { ip: 'fake-fermentation-1:3000' }
      ]
    });
    
    axios.post.mockRejectedValue(new Error('Internal POST failed'));

    const res = await request(app)
      .post('/simulation/pattern')
      .set('Authorization', `Bearer ${token}`)
      .send({ pattern: 'temp-spike' });

    expect(res.statusCode).toEqual(500);
  });
});
