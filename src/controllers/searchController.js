const { validationResult } = require('express-validator');
const College = require('../models/College');

const searchController = {
  async searchColleges(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid search parameters',
          errors: errors.array()
        });
      }

      const { state, district, course } = req.query;
      
      const filters = {};
      if (state) filters.state = state;
      if (district) filters.district = district;
      if (course) filters.course = course;

      const results = await College.search(filters);
      
      res.json({
        success: true,
        data: results,
        count: results.length,
        filters: filters
      });
    } catch (error) {
      console.error('Search controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during search'
      });
    }
  },

  async getStates(req, res) {
    try {
      const states = await College.getStates();
      res.json({
        success: true,
        data: ['All', ...states]
      });
    } catch (error) {
      console.error('Get states error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch states'
      });
    }
  },

  async getDistricts(req, res) {
    try {
      const { state } = req.query;
      const districts = await College.getDistrictsByState(state);
      res.json({
        success: true,
        data: ['All', ...districts]
      });
    } catch (error) {
      console.error('Get districts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch districts'
      });
    }
  },

  async getCourses(req, res) {
    try {
      const courses = await College.getCourses();
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses'
      });
    }
  }
};

module.exports = searchController;