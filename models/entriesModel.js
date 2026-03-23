'use strict';

const db = require('../config/db');

/**
 * Insert a new entry row.
 */
async function createEntry(data) {
  const sql = `
    INSERT INTO entries (
      start_date, end_date,
      awak, jawak, varning, dock_awak, dock_jawak,
      checkbox_flag, panni, potti_5, potti_10,
      solapur, kishan_dock_awak,
      other_value, other_price,
      private_total, public_total, commission_total
    ) VALUES (
      $1,  $2,
      $3,  $4,  $5,  $6,  $7,
      $8,  $9,  $10, $11,
      $12, $13,
      $14, $15,
      $16, $17, $18
    )
    RETURNING *
  `;
  const values = [
    data.start_date, data.end_date,
    data.awak, data.jawak, data.varning, data.dock_awak, data.dock_jawak,
    data.checkbox_flag, data.panni, data.potti_5, data.potti_10,
    data.solapur, data.kishan_dock_awak,
    data.other_value, data.other_price || null,
    data.private_total, data.public_total, data.commission_total,
  ];
  const { rows } = await db.query(sql, values);
  return rows[0];
}

/**
 * Fetch entries whose date range overlaps the given query range.
 * @param {string} startDate  ISO date string
 * @param {string} endDate    ISO date string
 */
async function getEntriesByRange(startDate, endDate) {
  const sql = `
    SELECT * FROM entries
    WHERE start_date <= $2 AND end_date >= $1
    ORDER BY start_date DESC, created_at DESC
  `;
  const { rows } = await db.query(sql, [startDate, endDate]);
  return rows;
}

/**
 * Fetch all entries ordered by most recent first.
 */
async function getAllEntries() {
  const { rows } = await db.query(
    'SELECT * FROM entries ORDER BY start_date DESC, created_at DESC'
  );
  return rows;
}

/**
 * Fetch a single entry by id.
 */
async function getEntryById(id) {
  const { rows } = await db.query('SELECT * FROM entries WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Delete an entry by id. Returns true if a row was deleted.
 */
async function deleteEntry(id) {
  const { rowCount } = await db.query('DELETE FROM entries WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { createEntry, getEntriesByRange, getAllEntries, getEntryById, deleteEntry };
