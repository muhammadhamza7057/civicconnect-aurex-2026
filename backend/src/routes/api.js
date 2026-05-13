const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const ticketRoutes = require('./tickets');
const analyticsRoutes = require('./analytics');
const announcementRoutes = require('./announcements');
const eventRoutes = require('./events');
const permitRoutes = require('./permits');
const departmentRoutes = require('./departments');
const auditRoutes = require('./audit');
const notificationRoutes = require('./notifications');
const errorHandler = require('../middleware/errorHandler');

router.get('/ping', (req, res) => res.json({ pong: true }));

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/announcements', announcementRoutes);
router.use('/events', eventRoutes);
router.use('/permits', permitRoutes);
router.use('/departments', departmentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/notifications', notificationRoutes);

router.use(errorHandler);

module.exports = router;
