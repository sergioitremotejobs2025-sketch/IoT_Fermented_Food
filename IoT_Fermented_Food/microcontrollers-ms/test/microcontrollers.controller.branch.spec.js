// Controller branch coverage tests for microcontrollers-ms
const request = require('supertest');

jest.mock('../src/database/dao');
jest.mock('node-cache');

const Dao = require('../src/database/dao');
const NodeCache = require('node-cache');

let mockCacheInstance = NodeCache.prototype;
let mockDaoInstance = Dao.prototype;

// Setup mock methods ONCE on prototypes
if (!mockDaoInstance.findByMeasure) Object.assign(mockDaoInstance, {
    findByMeasure: jest.fn(),
    findByUsername: jest.fn(),
    insertMicrocontroller: jest.fn(),
    updateMicrocontroller: jest.fn(),
    deleteMicrocontroller: jest.fn()
});
if (!mockCacheInstance.get) Object.assign(mockCacheInstance, {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
});

const app = require('../src/app/app');

beforeEach(() => {
    jest.clearAllMocks();
});

/*** GET '/' - cache hit ***/
test('GET / - returns cached data when present', async () => {
    const cached = [{ ip: '1.2.3.4', measure: 'temp' }];
    mockCacheInstance.get.mockReturnValueOnce(cached);

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(cached);
});

/*** GET '/' - cache miss ***/
test('GET / - fetches from DAO and caches when cache miss', async () => {
    const daoResult = [{ ip: '5.6.7.8', measure: 'humidity' }];
    mockCacheInstance.get.mockReturnValueOnce(undefined);
    mockDaoInstance.findByUsername.mockResolvedValueOnce(daoResult);

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(daoResult);
    expect(mockDaoInstance.findByUsername).toHaveBeenCalledWith(undefined);
});

/*** GET '/:measure' - cache hit ***/
test('GET /:measure - returns cached measure data', async () => {
    const measure = 'temperature';
    const cached = [{ ip: '9.9.9.9', measure }];
    mockCacheInstance.get.mockImplementation(key => (key === `/${measure}` ? cached : undefined));

    const res = await request(app).get(`/${measure}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(cached);
});

/*** GET '/:measure' - cache miss ***/
test('GET /:measure - fetches from DAO on cache miss', async () => {
    const measure = 'pressure';
    const daoResult = [{ ip: '10.0.0.1', measure }];
    mockCacheInstance.get.mockReturnValueOnce(undefined);
    mockDaoInstance.findByMeasure.mockResolvedValueOnce(daoResult);

    const res = await request(app).get(`/${measure}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(daoResult);
    expect(mockDaoInstance.findByMeasure).toHaveBeenCalledWith(measure);
    expect(mockCacheInstance.set).toHaveBeenCalledWith(`/${measure}`, daoResult);
});

/*** POST '/' - success ***/
test('POST / - creates microcontroller and returns 201', async () => {
    const payload = { ip: '1.1.1.1', measure: 'temp', sensor: 's', username: 'u' };
    mockDaoInstance.insertMicrocontroller.mockResolvedValueOnce(true);

    const res = await request(app).post('/').send(payload);
    expect(res.status).toBe(201);
    expect(mockDaoInstance.insertMicrocontroller).toHaveBeenCalledWith(payload);
});

/*** POST '/' - duplicate (no insert) ***/
test('POST / - duplicate returns 204', async () => {
    const payload = { ip: '2.2.2.2', measure: 'temp', sensor: 's', username: 'u' };
    mockDaoInstance.insertMicrocontroller.mockResolvedValueOnce(false);

    const res = await request(app).post('/').send(payload);
    expect(res.status).toBe(204);
});

/*** POST '/' - error handling ***/
test('POST / - DAO error returns 400', async () => {
    const payload = { ip: '3.3.3.3', measure: 'temp', sensor: 's', username: 'u' };
    mockDaoInstance.insertMicrocontroller.mockRejectedValueOnce(new Error('DB_ERROR'));

    const res = await request(app).post('/').send(payload);
    expect(res.status).toBe(400);
});

/*** POST '/' - validation failure ***/
test('POST / - missing fields returns 400', async () => {
    const payload = { ip: '4.4.4.4', measure: 'temp' }; // missing sensor, username
    const res = await request(app).post('/').send(payload);
    expect(res.status).toBe(400);
});

/*** PUT '/' - success ***/
test('PUT / - updates microcontroller and returns 201', async () => {
    const payload = { ip: '5.5.5.5', measure: 'temp', old_ip: '5.5.5.4', sensor: 's', username: 'u' };
    mockDaoInstance.updateMicrocontroller.mockResolvedValueOnce(true);

    const res = await request(app).put('/').send(payload);
    expect(res.status).toBe(201);
    const { old_ip, ...expectedPayload } = payload;
    expect(mockDaoInstance.updateMicrocontroller).toHaveBeenCalledWith(expect.objectContaining(expectedPayload));
});

/*** PUT '/' - not found ***/
test('PUT / - update not found returns 404', async () => {
    const payload = { ip: '6.6.6.6', measure: 'temp', old_ip: '6.6.6.5', sensor: 's', username: 'u' };
    mockDaoInstance.updateMicrocontroller.mockResolvedValueOnce(false);

    const res = await request(app).put('/').send(payload);
    expect(res.status).toBe(404);
});

/*** PUT '/' - error ***/
test('PUT / - DAO error returns 400', async () => {
    const payload = { ip: '7.7.7.7', measure: 'temp', old_ip: '7.7.7.6', sensor: 's', username: 'u' };
    mockDaoInstance.updateMicrocontroller.mockRejectedValueOnce(new Error('DB_ERROR'));

    const res = await request(app).put('/').send(payload);
    expect(res.status).toBe(400);
});

/*** PUT '/' - validation failure ***/
test('PUT / - missing fields returns 400', async () => {
    const payload = { ip: '8.8.8.8', measure: 'temp' }; // missing old_ip, sensor, username
    const res = await request(app).put('/').send(payload);
    expect(res.status).toBe(400);
});

/*** DELETE '/' - success ***/
test('DELETE / - deletes microcontroller and returns 200', async () => {
    const payload = { ip: '9.9.9.9', measure: 'temp' };
    mockDaoInstance.deleteMicrocontroller.mockResolvedValueOnce(true);

    const res = await request(app).delete('/').send(payload);
    expect(res.status).toBe(200);
    expect(mockDaoInstance.deleteMicrocontroller).toHaveBeenCalledWith(payload);
});

/*** DELETE '/' - not found ***/
test('DELETE / - delete not found returns 404', async () => {
    const payload = { ip: '10.10.10.10', measure: 'temp' };
    mockDaoInstance.deleteMicrocontroller.mockResolvedValueOnce(false);

    const res = await request(app).delete('/').send(payload);
    expect(res.status).toBe(404);
});

/*** DELETE '/' - error ***/
test('DELETE / - DAO error returns 400', async () => {
    const payload = { ip: '11.11.11.11', measure: 'temp' };
    mockDaoInstance.deleteMicrocontroller.mockRejectedValueOnce(new Error('DB_ERROR'));

    const res = await request(app).delete('/').send(payload);
    expect(res.status).toBe(400);
});
