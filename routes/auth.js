'use strict';

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required.')
      .isLength({ max: 100 }).withMessage('Username too long.'),
    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ max: 200 }).withMessage('Password too long.'),
  ],
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', authController.me);

module.exports = router;
