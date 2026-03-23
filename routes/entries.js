'use strict';

const express = require('express');
const { body, param, query } = require('express-validator');
const entriesController = require('../controllers/entriesController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const numericField = (field) =>
  body(field)
    .optional({ nullable: true })
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a non-negative number.`);

const entryValidation = [
  body('start_date')
    .notEmpty().withMessage('Start date is required.')
    .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD).'),
  body('end_date')
    .notEmpty().withMessage('End date is required.')
    .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD).')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.start_date)) {
        throw new Error('End date must be on or after start date.');
      }
      return true;
    }),
  numericField('awak'),
  numericField('jawak'),
  numericField('varning'),
  numericField('dock_awak'),
  numericField('dock_jawak'),
  numericField('checkbox_flag'),
  numericField('panni'),
  numericField('potti_5'),
  numericField('potti_10'),
  numericField('solapur'),
  numericField('kishan_dock_awak'),
  numericField('other_value'),
  body('other_price')
    .optional({ nullable: true })
    .custom((val, { req }) => {
      if (req.body.other_value && parseFloat(req.body.other_value) > 0) {
        if (val === undefined || val === null || val === '') return true; // allowed to be empty
        if (isNaN(parseFloat(val)) || parseFloat(val) < 0) {
          throw new Error('Other price must be a non-negative number.');
        }
      }
      return true;
    }),
];

router.post('/preview', entryValidation, entriesController.previewEntry);

router.post('/', entryValidation, entriesController.createEntry);

router.get(
  '/',
  [
    query('start_date').optional().isISO8601().withMessage('start_date must be YYYY-MM-DD.'),
    query('end_date').optional().isISO8601().withMessage('end_date must be YYYY-MM-DD.'),
  ],
  entriesController.getEntries
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer.')],
  entriesController.getEntryById
);

router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer.')],
  entriesController.deleteEntry
);

module.exports = router;
