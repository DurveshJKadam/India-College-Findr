const express = require('express');
const { body } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');

const router = express.Router();

// Validation middleware
const messageValidation = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Routes
router.post('/', messageValidation, chatbotController.processMessage);

module.exports = router;