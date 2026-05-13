const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const ctrl = require('../controllers/permitController');

router.get('/mine', authenticateUser, ctrl.listMyPermits);
router.post('/', authenticateUser, ctrl.createPermitDraft);
router.patch('/:id', authenticateUser, ctrl.updatePermitWizard);
router.post('/:id/submit', authenticateUser, ctrl.submitPermit);
router.post('/:id/review', authenticateUser, authorizeRoles(['admin', 'super_admin']), ctrl.reviewPermit);

module.exports = router;
