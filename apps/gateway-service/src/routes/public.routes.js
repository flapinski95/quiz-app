const express = require('express');
const router = express.Router();
const proxy = require('../utils/httpProxy');

// Przykład proxy dla user-service
router.use('/users', proxy('http://user-service:3002'));

module.exports = router;