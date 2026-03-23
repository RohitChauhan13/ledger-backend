'use strict';

const db = require('../config/db');

/**
 * Return the single global rates row (id = 1).
 */
async function getRates() {
  const { rows } = await db.query('SELECT * FROM rates WHERE id = 1 LIMIT 1');
  return rows[0] || null;
}

/**
 * Update the global rates row with a partial object of field→value pairs.
 * @param {Record<string, number>} fields
 */
async function updateRates(fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) throw new Error('No fields to update');

  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map((k) => fields[k]);
  values.push(1); // WHERE id = 1

  const sql = `
    UPDATE rates
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING *
  `;
  const { rows } = await db.query(sql, values);
  return rows[0];
}

module.exports = { getRates, updateRates };
