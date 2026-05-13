const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');
const ticketController = require('../controllers/ticketController');
const { createTicketValidators } = require('../validators/ticketValidator');
const { upload } = require('../services/uploadService');

// POST /tickets - create ticket (authenticated)
router.post('/', authenticateUser, upload.array('attachments', 5), createTicketValidators, ticketController.createTicket);

// GET /tickets - staff+ can list tickets; residents can use /my
router.get('/', authenticateUser, authorizeRoles(['staff']), ticketController.getAllTickets);

// GET /tickets/my - resident's tickets
router.get('/my', authenticateUser, ticketController.getMyTickets);

// GET /tickets/:id
router.get('/:id', authenticateUser, ticketController.getTicketById);

// Update status
router.put('/:id/status', authenticateUser, authorizeRoles(['staff']), ticketController.updateTicketStatus);

// Assign ticket
router.post('/:id/assign', authenticateUser, authorizeRoles(['staff','department_admin']), ticketController.assignTicketToStaff);

// Add comment
router.post('/:id/comments', authenticateUser, ticketController.addTicketComment);

// Timeline
router.get('/:id/timeline', authenticateUser, ticketController.getTicketTimeline);

module.exports = router;
