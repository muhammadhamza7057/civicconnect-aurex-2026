const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const ctrl = require('../controllers/announcementController');

router.get('/', authenticateUser, ctrl.listAnnouncements);
router.post('/', authenticateUser, authorizeRoles(['admin', 'super_admin']), ctrl.createAnnouncement);

module.exports = router;
