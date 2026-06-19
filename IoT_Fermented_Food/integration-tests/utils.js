const request = require('supertest');

const login = async (url, credentials) => {
    const res = await request(url)
        .post('/login')
        .send(credentials);
    return res.body.accessToken;
};

const registerMCU = async (url, token, mcuData) => {
    return await request(url)
        .post('/microcontrollers')
        .set('Authorization', `Bearer ${token}`)
        .send(mcuData);
};

const publishData = async (url, token, measure, data) => {
    return await request(url)
        .post(`/${measure}`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
};

const trainAI = async (url, token, trainData) => {
    return await request(url)
        .post('/ai/train')
        .set('Authorization', `Bearer ${token}`)
        .send(trainData);
};

module.exports = {
    login,
    registerMCU,
    publishData,
    trainAI
};
