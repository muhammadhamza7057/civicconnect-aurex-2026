const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const ctrl = require('../controllers/auditLogController');

router.get('/', authenticateUser, authorizeRoles(['super_admin']), ctrl.listAuditLogs);

module.exports = router;
