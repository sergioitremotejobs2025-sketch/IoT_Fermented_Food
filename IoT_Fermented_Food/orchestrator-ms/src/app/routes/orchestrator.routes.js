const { Router } = require('express')
const { expressjwt: expressJwt } = require('express-jwt')

const { TOKEN_SECRET } = require('../../config/jwt.config')
const OrchestratorController = require('../controllers/orchestrator.controller')

const jwtMiddleware = expressJwt({ algorithms: ['HS256'], secret: TOKEN_SECRET, requestProperty: 'user' })
const orchestratorController = new OrchestratorController()
const router = Router()

/**
 * @swagger
 * /humidity:
 *   get:
 *     summary: Get humidity measures
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/humidity', jwtMiddleware, orchestratorController.getMeasureService)

/**
 * @swagger
 * /light:
 *   get:
 *     summary: Get light measures
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/light', jwtMiddleware, orchestratorController.getMeasureService)

/**
 * @swagger
 * /temperature:
 *   get:
 *     summary: Get temperature measures
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/temperature', jwtMiddleware, orchestratorController.getMeasureService)

/**
 * @swagger
 * /pictures:
 *   get:
 *     summary: Get pictures
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/pictures', jwtMiddleware, orchestratorController.getMeasureService)

/**
 * @swagger
 * /light:
 *   post:
 *     summary: Turn light on/off
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.post('/light', jwtMiddleware, orchestratorController.postMeasureService)

/**
 * @swagger
 * /temperature:
 *   post:
 *     summary: Post temperature measure
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.post('/temperature', jwtMiddleware, orchestratorController.postMeasureService)

/**
 * @swagger
 * /humidity:
 *   post:
 *     summary: Post humidity measure
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.post('/humidity', jwtMiddleware, orchestratorController.postMeasureService)

/**
 * @swagger
 * /microcontrollers:
 *   get:
 *     summary: Get all microcontrollers
 *     tags: [Microcontrollers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/microcontrollers', jwtMiddleware, orchestratorController.getMicrocontrollers)

/**
 * @swagger
 * /microcontrollers:
 *   post:
 *     summary: Add a new microcontroller
 *     tags: [Microcontrollers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/microcontrollers', jwtMiddleware, orchestratorController.postMicrocontrollers)

/**
 * @swagger
 * /microcontrollers:
 *   put:
 *     summary: Update a microcontroller
 *     tags: [Microcontrollers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/microcontrollers', jwtMiddleware, orchestratorController.putMicrocontrollers)

/**
 * @swagger
 * /microcontrollers:
 *   delete:
 *     summary: Delete a microcontroller
 *     tags: [Microcontrollers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/microcontrollers', jwtMiddleware, orchestratorController.deleteMicrocontrollers)

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.post('/login', orchestratorController.login)

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/register', orchestratorController.register)

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/refresh', orchestratorController.refresh)

/**
 * @swagger
 * /change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/change-password', jwtMiddleware, orchestratorController.changePassword)

/**
 * @swagger
 * /ai/train:
 *   post:
 *     summary: Train AI model for a sensor
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/ai/train', jwtMiddleware, orchestratorController.trainAI)

/**
 * @swagger
 * /ai/predict:
 *   post:
 *     summary: Get prediction for a sensor
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/ai/predict', jwtMiddleware, orchestratorController.predictAI)
/**
 * @swagger
 * /measures/history:
 *   get:
 *     summary: Get sensor history
 *     tags: [Measures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/measures/history', jwtMiddleware, orchestratorController.getMeasureHistory)

/**
 * @swagger
 * /ai/evaluate:
 *   post:
 *     summary: Evaluate AI model for a sensor
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/ai/evaluate', jwtMiddleware, orchestratorController.evaluateAI)

/**
 * @swagger
 * /simulation/pattern:
 *   post:
 *     summary: Set simulation pattern for all fake sensors
 *     tags: [Simulation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Error
 */
router.post('/simulation/pattern', jwtMiddleware, orchestratorController.postSimulationPattern)

router.use((error, req, res, next) => {
  if (error.name === 'UnauthorizedError') {
    res.sendStatus(401)
  } else {
    next(error)
  }
})

module.exports = router
