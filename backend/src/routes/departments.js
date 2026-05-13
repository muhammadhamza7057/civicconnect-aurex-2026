const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const ctrl = require('../controllers/departmentController');

router.get('/', ctrl.listDepartments);
router.post('/', authenticateUser, authorizeRoles(['super_admin']), ctrl.createDepartment);
router.patch('/:id', authenticateUser, authorizeRoles(['super_admin']), ctrl.updateDepartment);
router.get('/:id/staff', authenticateUser, authorizeRoles(['admin', 'super_admin']), ctrl.listStaffForDepartment);

module.exports = router;
