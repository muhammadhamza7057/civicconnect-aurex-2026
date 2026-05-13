const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const ticketRoutes = require('./tickets');
const analyticsRoutes = require('./analytics');
const errorHandler = require('../middleware/errorHandler');

router.get('/ping', (req, res) => res.json({ pong: true }));

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/analytics', analyticsRoutes);

// attach generic error handler
router.use(errorHandler);

module.exports = router;
