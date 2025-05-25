const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: `Secure route — user ${req.kauth.grant.access_token.content.preferred_username} authenticated.` });
});

module.exports = router;