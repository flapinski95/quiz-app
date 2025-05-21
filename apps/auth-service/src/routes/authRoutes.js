const express = require('express');
const { register, login, verify2FA } = require('../controllers/authController');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  res.json({ token });
});

module.exports = router;