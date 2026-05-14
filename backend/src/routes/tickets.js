const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const ticketController = require('../controllers/ticketController');
const { createTicketValidators } = require('../validators/ticketValidator');
const { upload } = require('../services/uploadService');

router.post('/', authenticateUser, upload.array('attachments', 5), createTicketValidators, ticketController.createTicket);

router.get('/', authenticateUser, authorizeRoles(['staff']), ticketController.getAllTickets);

router.get('/my', authenticateUser, ticketController.getMyTickets);

router.get('/:id', authenticateUser, ticketController.getTicketById);

router.put('/:id/status', authenticateUser, authorizeRoles(['staff']), ticketController.updateTicketStatus);
router.patch('/:id/status', authenticateUser, authorizeRoles(['staff']), ticketController.updateTicketStatus);

router.post('/:id/escalate', authenticateUser, authorizeRoles(['staff']), ticketController.escalateTicket);

router.post('/:id/assign', authenticateUser, authorizeRoles(['staff']), ticketController.assignTicketToStaff);

router.post('/:id/comments', authenticateUser, ticketController.addTicketComment);

router.get('/:id/timeline', authenticateUser, ticketController.getTicketTimeline);

module.exports = router;
