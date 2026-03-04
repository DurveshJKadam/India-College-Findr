const { validationResult } = require('express-validator');
const College = require('../models/College');
const ChatbotService = require('../services/chatbotService');

const chatbotController = {
  async processMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid message format',
          errors: errors.array()
        });
      }

      const { message } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message cannot be empty'
        });
      }

      // Extract entities from user message
      const entities = ChatbotService.extractEntities(message);
      
      // Search database based on extracted entities
      const results = await College.chatbotSearch(entities);
      
      // Format response
      const response = ChatbotService.formatResponse(message, entities, results);
      
      res.json({
        success: true,
        data: {
          userMessage: message,
          botResponse: response,
          results: results,
          extractedEntities: entities
        }
      });
    } catch (error) {
      console.error('Chatbot controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Sorry, I encountered an error processing your request. Please try again.'
      });
    }
  }
};

module.exports = chatbotController;