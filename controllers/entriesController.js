'use strict';

const { validationResult } = require('express-validator');
const entriesModel = require('../models/entriesModel');
const ratesModel = require('../models/ratesModel');

/**
 * Compute private_total, public_total, commission_total from raw values + rates.
 */
function calculateTotals(data, rates) {
  const fields = [
    { key: 'awak',             rateKey: 'awak' },
    { key: 'jawak',            rateKey: 'jawak' },
    { key: 'varning',          rateKey: 'varning' },
    { key: 'dock_awak',        rateKey: 'dock_awak' },
    { key: 'dock_jawak',       rateKey: 'dock_jawak' },
    { key: 'checkbox_flag',    rateKey: 'checkbox_flag' },
    { key: 'panni',            rateKey: 'panni' },
    { key: 'potti_5',          rateKey: 'potti_5' },
    { key: 'potti_10',         rateKey: 'potti_10' },
    { key: 'solapur',          rateKey: 'solapur' },
    { key: 'kishan_dock_awak', rateKey: 'kishan_dock_awak' },
  ];

  let privateTotal = 0;
  let publicTotal = 0;
  let commissionTotal = 0;

  for (const { key, rateKey } of fields) {
    const val = parseFloat(data[key]) || 0;
    const privRate = parseFloat(rates[`${rateKey}_private_rate`]) || 0;
    const pubRate = parseFloat(rates[`${rateKey}_public_rate`]) || 0;
    const commRate = parseFloat(rates[`${rateKey}_commission_rate`]) || 0;

    privateTotal += val * privRate;
    publicTotal += val * pubRate;
    commissionTotal += val * commRate;
  }

  // "Other" field: uses its own price instead of rate-based calculation,
  // but commission rate still applies to other_value
  if (data.other_value && parseFloat(data.other_value) > 0) {
    const otherVal = parseFloat(data.other_value) || 0;
    const otherPrice = parseFloat(data.other_price) || 0;
    const otherPrivRate = parseFloat(rates['other_private_rate']) || 0;
    const otherPubRate = parseFloat(rates['other_public_rate']) || 0;
    const otherCommRate = parseFloat(rates['other_commission_rate']) || 0;

    // If other_price is provided by user, it overrides rate-based calc for private/public
    if (otherPrice > 0) {
      privateTotal += otherVal * otherPrice;
      publicTotal += otherVal * otherPrice;
    } else {
      privateTotal += otherVal * otherPrivRate;
      publicTotal += otherVal * otherPubRate;
    }
    commissionTotal += otherVal * otherCommRate;
  }

  return {
    private_total: Math.round(privateTotal * 100) / 100,
    public_total: Math.round(publicTotal * 100) / 100,
    commission_total: Math.round(commissionTotal * 100) / 100,
  };
}

/**
 * POST /api/entries
 */
async function createEntry(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const rates = await ratesModel.getRates();
    if (!rates) {
      return res.status(500).json({ success: false, message: 'Rates configuration not found.' });
    }

    const {
      start_date, end_date,
      awak = 0, jawak = 0, varning = 0,
      dock_awak = 0, dock_jawak = 0, checkbox_flag = 0,
      panni = 0, potti_5 = 0, potti_10 = 0,
      solapur = 0, kishan_dock_awak = 0,
      other_value = 0, other_price,
    } = req.body;

    const rawData = {
      awak, jawak, varning, dock_awak, dock_jawak,
      checkbox_flag, panni, potti_5, potti_10,
      solapur, kishan_dock_awak,
      other_value, other_price,
    };

    const totals = calculateTotals(rawData, rates);

    const entry = await entriesModel.createEntry({
      start_date,
      end_date,
      ...rawData,
      ...totals,
    });

    res.status(201).json({ success: true, data: entry, message: 'Entry created successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/entries?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Returns entries overlapping the given range (or all if no range given).
 */
async function getEntries(req, res, next) {
  try {
    const { start_date, end_date } = req.query;

    let entries;
    if (start_date && end_date) {
      entries = await entriesModel.getEntriesByRange(start_date, end_date);
    } else {
      entries = await entriesModel.getAllEntries();
    }

    res.json({ success: true, data: entries, count: entries.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/entries/:id
 */
async function getEntryById(req, res, next) {
  try {
    const entry = await entriesModel.getEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }
    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/entries/:id
 */
async function deleteEntry(req, res, next) {
  try {
    const deleted = await entriesModel.deleteEntry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }
    res.json({ success: true, message: 'Entry deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/entries/preview
 * Preview calculated totals without saving.
 */
async function previewEntry(req, res, next) {
  try {
    const rates = await ratesModel.getRates();
    if (!rates) {
      return res.status(500).json({ success: false, message: 'Rates not configured.' });
    }
    const totals = calculateTotals(req.body, rates);
    res.json({ success: true, data: totals });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEntry, getEntries, getEntryById, deleteEntry, previewEntry };
