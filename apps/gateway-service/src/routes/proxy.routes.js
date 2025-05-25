const express = require('express');
const router = express.Router();
const proxy = require('../utils/httpProxy');

// Wszystkie zapytania do /api/users/... będą szły do user-service
router.use('/', proxy('http://user-service:3002'));

module.exports = router;