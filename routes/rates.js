'use strict';

const express = require('express');
const { body } = require('express-validator');
const ratesController = require('../controllers/ratesController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All rate routes require authentication
router.use(requireAuth);

router.get('/', ratesController.getRates);

router.put(
  '/',
  [
    // Validate every numeric rate field that might be present
    body('*.').optional().isFloat({ min: 0 }).withMessage('All rate values must be non-negative numbers.'),
  ],
  ratesController.updateRates
);

module.exports = router;
