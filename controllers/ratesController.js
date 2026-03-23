'use strict';

const { validationResult } = require('express-validator');
const ratesModel = require('../models/ratesModel');

/**
 * GET /api/rates
 * Returns the current rates configuration.
 */
async function getRates(req, res, next) {
  try {
    const rates = await ratesModel.getRates();
    if (!rates) {
      return res.status(404).json({ success: false, message: 'Rates not found.' });
    }
    res.json({ success: true, data: rates });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/rates
 * Updates one or more rate fields.
 */
async function updateRates(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    // Whitelist of valid column names
    const ALLOWED_FIELDS = [
      'awak_private_rate', 'awak_public_rate', 'awak_commission_rate',
      'jawak_private_rate', 'jawak_public_rate', 'jawak_commission_rate',
      'varning_private_rate', 'varning_public_rate', 'varning_commission_rate',
      'dock_awak_private_rate', 'dock_awak_public_rate', 'dock_awak_commission_rate',
      'dock_jawak_private_rate', 'dock_jawak_public_rate', 'dock_jawak_commission_rate',
      'checkbox_flag_private_rate', 'checkbox_flag_public_rate', 'checkbox_flag_commission_rate',
      'panni_private_rate', 'panni_public_rate', 'panni_commission_rate',
      'potti_5_private_rate', 'potti_5_public_rate', 'potti_5_commission_rate',
      'potti_10_private_rate', 'potti_10_public_rate', 'potti_10_commission_rate',
      'solapur_private_rate', 'solapur_public_rate', 'solapur_commission_rate',
      'kishan_dock_awak_private_rate', 'kishan_dock_awak_public_rate', 'kishan_dock_awak_commission_rate',
      'other_private_rate', 'other_public_rate', 'other_commission_rate',
    ];

    const fields = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        const val = parseFloat(req.body[key]);
        if (!isNaN(val) && val >= 0) {
          fields[key] = val;
        }
      }
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid rate fields provided.' });
    }

    const updated = await ratesModel.updateRates(fields);
    res.json({ success: true, data: updated, message: 'Rates updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRates, updateRates };
