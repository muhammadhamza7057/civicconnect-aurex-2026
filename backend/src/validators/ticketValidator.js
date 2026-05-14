const { body } = require('express-validator');
const mongoose = require('mongoose');

const validPriorities = ['low','medium','high','critical','emergency'];

const createTicketValidators = [
  body('title').isString().trim().isLength({ min: 5 }).withMessage('Please enter a ticket title'),
  body('description').isString().trim().isLength({ min: 20 }).withMessage('Please enter a valid description'),
  body('priority').optional().isIn(validPriorities).withMessage('Priority is required'),
  body('department').optional({ checkFalsy: true }).custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Please select a valid department'),
  body('department_id').optional({ checkFalsy: true }).custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Please select a valid department'),
  body('location').optional({ checkFalsy: true }).custom(loc => {
    let value = loc;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (_) {
        throw new Error('Location information missing');
      }
    }
    if (typeof value !== 'object' || value === null) throw new Error('Location information missing');
    if (!('lat' in value) || !('lng' in value)) throw new Error('Location information missing');
    return true;
  })
];

module.exports = { createTicketValidators };
