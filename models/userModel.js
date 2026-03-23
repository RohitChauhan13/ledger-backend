'use strict';

const db = require('../config/db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Find a user by username.
 * @param {string} username
 */
async function findByUsername(username) {
  const { rows } = await db.query(
    'SELECT id, username, password FROM users WHERE username = $1 LIMIT 1',
    [username]
  );
  return rows[0] || null;
}

/**
 * Find a user by id.
 * @param {number} id
 */
async function findById(id) {
  const { rows } = await db.query(
    'SELECT id, username FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Create a new user with a hashed password.
 * @param {string} username
 * @param {string} plainPassword
 */
async function createUser(username, plainPassword) {
  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  const { rows } = await db.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, hashed]
  );
  return rows[0];
}

/**
 * Verify a plain-text password against the stored hash.
 * @param {string} plain
 * @param {string} hash
 */
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { findByUsername, findById, createUser, verifyPassword };
