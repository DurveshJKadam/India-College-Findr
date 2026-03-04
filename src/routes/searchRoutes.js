const express = require('express');
const { query } = require('express-validator');
const searchController = require('../controllers/searchController');

const router = express.Router();

// Validation middleware
const searchValidation = [
  query('state').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('district').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('course').optional().isString().trim().isLength({ min: 1, max: 200 })
];

const stateValidation = [
  query('state').optional().isString().trim().isLength({ min: 1, max: 100 })
];

// Routes
router.get('/', searchValidation, searchController.searchColleges);
router.get('/states', searchController.getStates);
router.get('/districts', stateValidation, searchController.getDistricts);
router.get('/courses', searchController.getCourses);

module.exports = router;