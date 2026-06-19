const { Router } = require('express')

const MeasureController = require('../controllers/measure.controller')
const { requireInternalKey } = require('../middleware/internal-auth.middleware')

const router = Router()

// Guard every data route with the internal API-key middleware
router.use(requireInternalKey)

const humidityController = new MeasureController('humidity')
const lightController = new MeasureController('light')
const temperatureController = new MeasureController('temperature')
const picturesController = new MeasureController('pictures')

router.get('/humidity', humidityController.getMeasure)
router.get('/humidities', humidityController.getMeasures)
router.post('/humidity', humidityController.postMeasure)

router.get('/light', lightController.getMeasure)
router.get('/lights', lightController.getMeasures)
router.post('/light', lightController.postLight)
router.post('/light/measure', lightController.postMeasure)

router.get('/temperature', temperatureController.getMeasure)
router.get('/temperatures', temperatureController.getMeasures)
router.post('/temperature', temperatureController.postMeasure)

router.get('/pictures', picturesController.getMeasure)
router.get('/pictures/history', picturesController.getMeasures)

module.exports = router

