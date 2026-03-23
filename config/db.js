'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'ledger_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    ca: process.env.AIVEN_SSL || '',
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Execute a query with optional parameters.
 * @param {string} text  SQL query string
 * @param {Array}  params Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Get a client from the pool (for transactions).
 */
async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
