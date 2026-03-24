const express = require('express');
const healthController = require('../controllers/healthController.js');

const router = express.Router();

router.get('/', healthController.getHealth);

module.exports = router;