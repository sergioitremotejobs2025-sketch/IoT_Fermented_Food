const { Router } = require('express')
const MicrocontrollersController = require('../controllers/microcontrollers.controller')
const { requireInternalKey } = require('../middleware/internal-auth.middleware')

const microcontrollersController = new MicrocontrollersController()
const router = Router()

// Guard every route with the internal API-key middleware
router.use(requireInternalKey)

router.get('/', microcontrollersController.getMicrocontrollers)
router.get('/:measure', microcontrollersController.getMicrocontrollersFromMS)
router.post('/pair', microcontrollersController.pairMicrocontroller)
router.post('/', microcontrollersController.postMicrocontrollers)
router.put('/', microcontrollersController.putMicrocontrollers)
router.delete('/', microcontrollersController.deleteMicrocontrollers)

module.exports = router
