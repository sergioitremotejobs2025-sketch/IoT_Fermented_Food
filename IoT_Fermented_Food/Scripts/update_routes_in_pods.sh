#!/bin/sh
ORC_POD=$(kubectl get pods -l app=orchestrator-ms -o jsonpath='{.items[0].metadata.name}')
MEASURE_POD=$(kubectl get pods -l app=measure-ms -o jsonpath='{.items[0].metadata.name}')

kubectl exec "$ORC_POD" -- sh -c "cat << 'INNEREOF' > src/app/routes/orchestrator.routes.js
const { Router } = require('express')
const expressJwt = require('express-jwt')

const { TOKEN_SECRET } = require('../../config/jwt.config')
const OrchestratorController = require('../controllers/orchestrator.controller')

const jwtMiddleware = expressJwt({ algorithms: ['HS256'], secret: TOKEN_SECRET })
const orchestratorController = new OrchestratorController()
const router = Router()

router.get('/humidity', jwtMiddleware, orchestratorController.getMeasureService)
router.get('/light', jwtMiddleware, orchestratorController.getMeasureService)
router.get('/temperature', jwtMiddleware, orchestratorController.getMeasureService)
router.get('/pictures', jwtMiddleware, orchestratorController.getMeasureService)

router.post('/light', jwtMiddleware, orchestratorController.postMeasureService)

router.get('/microcontrollers', jwtMiddleware, orchestratorController.getMicrocontrollers)
router.post('/microcontrollers', jwtMiddleware, orchestratorController.postMicrocontrollers)
router.put('/microcontrollers', jwtMiddleware, orchestratorController.putMicrocontrollers)
router.delete('/microcontrollers', jwtMiddleware, orchestratorController.deleteMicrocontrollers)

router.post('/login', orchestratorController.login)
router.post('/register', orchestratorController.register)
router.post('/refresh', orchestratorController.refresh)

router.use((error, req, res, next) => {
  if (error.name === expressJwt.UnauthorizedError.name) {
    res.sendStatus(401)
  }
})

module.exports = router
INNEREOF"

kubectl exec "$MEASURE_POD" -- sh -c "cat << 'INNEREOF' > src/app/routes/measure.routes.js
const { Router } = require('express')
const MeasureController = require('../controllers/measure.controller')

const router = Router()
const humidityController = new MeasureController('humidity')
const lightController = new MeasureController('light')
const temperatureController = new MeasureController('temperature')
const picturesController = new MeasureController('pictures')

router.get('/humidity', humidityController.getMeasure)
router.get('/humidities', humidityController.getMeasures)

router.get('/light', lightController.getMeasure)
router.get('/lights', lightController.getMeasures)
router.post('/light', lightController.postLight)

router.get('/temperature', temperatureController.getMeasure)
router.get('/temperatures', temperatureController.getMeasures)

router.get('/pictures', picturesController.getMeasure)
router.get('/picturess', picturesController.getMeasures)

module.exports = router
INNEREOF"

kubectl exec "$ORC_POD" -- pkill node
kubectl exec "$MEASURE_POD" -- pkill node
