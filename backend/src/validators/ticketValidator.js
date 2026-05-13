const { body } = require('express-validator');
const mongoose = require('mongoose');

const validPriorities = ['low','medium','high','critical','emergency'];

const createTicketValidators = [
  body('title').isString().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').isString().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('priority').optional().isIn(validPriorities).withMessage('Invalid priority'),
  body('department').optional().custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid department id'),
  body('location').optional().custom(loc => {
    if (typeof loc !== 'object') throw new Error('Location must be an object');
    if (!('lat' in loc) || !('lng' in loc)) throw new Error('Location must include lat and lng');
    return true;
  })
];

module.exports = { createTicketValidators };
