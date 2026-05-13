const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const cookieParser = require('cookie-parser');
const authController = require('../controllers/authController');
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(cookieParser());

router.post('/register', rateLimiter({ windowMs: 60 * 1000, max: 6 }), authController.register);
router.post('/login', rateLimiter({ windowMs: 60 * 1000, max: 8 }), authController.login);
router.post('/refresh', rateLimiter({ windowMs: 60 * 1000, max: 30 }), authController.refresh);
router.post('/logout', authenticateUser, authController.logout);

router.get('/me', authenticateUser, authController.me);
router.patch('/profile', authenticateUser, authController.updateProfile);

router.post('/2fa/verify-sim', authenticateUser, authController.verifyTwoFactorSim);
router.post('/security/ip-restriction-sim', authenticateUser, authController.setIpRestrictionSim);

router.get('/admin-check', authenticateUser, authorizeRoles(['admin']), (req, res) => {
  res.json({ data: { ok: true, role: req.user.role } });
});

module.exports = router;
