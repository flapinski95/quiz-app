const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Gateway alive' });
});

module.exports = router;
