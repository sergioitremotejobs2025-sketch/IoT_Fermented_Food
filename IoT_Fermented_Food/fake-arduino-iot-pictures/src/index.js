const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Growth stages configuration
const STAGES = [
    { id: 1, name: 'seedling', file: 'stage_1.png', duration_min: 1 },
    { id: 2, name: 'young_plant', file: 'stage_2.png', duration_min: 2 },
    { id: 3, name: 'flowering', file: 'stage_3.png', duration_min: 2 },
    { id: 4, name: 'green_fruit', file: 'stage_4.png', duration_min: 3 },
    { id: 5, name: 'ripe_fruit', file: 'stage_5.png', duration_min: 5 }
];

// Allow injection of start time for testing determinism
let START_TIME = Date.now();
const setStartTime = (t) => { START_TIME = t; };

const getCurrentStage = () => {
    const elapsedMinutes = (Date.now() - START_TIME) / (1000 * 60);
    let currentStage = STAGES[0];
    let rollingTime = 0;
    for (const stage of STAGES) {
        rollingTime += stage.duration_min;
        if (elapsedMinutes < rollingTime) {
            currentStage = stage;
            break;
        }
        currentStage = stage;
    }
    return { currentStage, elapsedMinutes };
};

app.get('/camera/latest', (req, res) => {
    const { currentStage, elapsedMinutes } = getCurrentStage();
    const PORT = process.env.PORT || 3005;
    res.json({
        stage: currentStage.name,
        stage_id: currentStage.id,
        elapsed_minutes: elapsedMinutes.toFixed(2),
        image_url: `http://localhost:${PORT}/images/${currentStage.file}`
    });
});

app.get('/pictures', (req, res) => {
    const { currentStage, elapsedMinutes } = getCurrentStage();
    const PORT = process.env.PORT || 3005;
    res.json({
        pictures: currentStage.id,
        stage: currentStage.name,
        stage_id: currentStage.id,
        elapsed_minutes: elapsedMinutes.toFixed(2),
        image_url: `http://localhost:${PORT}/images/${currentStage.file}`
    });
});

app.get('/temperature', (req, res) => {
    const { currentStage } = getCurrentStage();
    res.json({ temperature: currentStage.id * 10 });
});

app.get('/camera/image', (req, res) => {
    const { currentStage } = getCurrentStage();
    res.sendFile(path.join(__dirname, `../public/images/${currentStage.file}`));
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'fake-arduino-iot-pictures' });
});

module.exports = { app, setStartTime, STAGES };
