'use strict';

const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await userModel.findByUsername(username.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const valid = await userModel.verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Regenerate session to prevent fixation
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ success: true, message: 'Logged in.', username: user.username });
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out.' });
  });
}

/**
 * GET /api/auth/me
 */
async function me(req, res) {
  if (req.session && req.session.userId) {
    return res.json({ success: true, userId: req.session.userId, username: req.session.username });
  }
  res.status(401).json({ success: false, message: 'Not authenticated.' });
}

module.exports = { login, logout, me };
