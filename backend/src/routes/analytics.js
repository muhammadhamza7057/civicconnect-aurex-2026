const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const analyticsController = require('../controllers/analyticsController');

router.get('/system', authenticateUser, authorizeRoles(['super_admin']), analyticsController.getSystemAnalytics);

router.get('/department', authenticateUser, authorizeRoles(['staff', 'admin', 'super_admin']), analyticsController.getDepartmentAnalytics);

router.get('/export/tickets.csv', authenticateUser, authorizeRoles(['staff', 'admin', 'super_admin']), analyticsController.exportTicketsCsv);

module.exports = router;
