const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const ctrl = require('../controllers/eventController');

router.get('/', ctrl.listEvents);
router.post('/:id/register', authenticateUser, ctrl.registerForEvent);

module.exports = router;
