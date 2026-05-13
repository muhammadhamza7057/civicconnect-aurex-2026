const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const analyticsController = require('../controllers/analyticsController');

// Super Admin only: System-wide analytics
router.get('/system', authenticateUser, authorizeRoles(['super_admin']), analyticsController.getSystemAnalytics);

// Staff and Dept Admin: Department analytics
router.get('/department', authenticateUser, authorizeRoles(['staff', 'department_admin', 'super_admin']), analyticsController.getDepartmentAnalytics);

module.exports = router;
