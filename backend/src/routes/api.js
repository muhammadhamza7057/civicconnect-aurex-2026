const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const ticketRoutes = require('./tickets');
const errorHandler = require('../middleware/errorHandler');

router.get('/ping', (req, res) => res.json({ pong: true }));

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);

// attach generic error handler
router.use(errorHandler);

module.exports = router;
