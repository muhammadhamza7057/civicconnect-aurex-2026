const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const ctrl = require('../controllers/notificationController');

router.get('/', authenticateUser, ctrl.list);
router.patch('/:id/read', authenticateUser, ctrl.markRead);

module.exports = router;
