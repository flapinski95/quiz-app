// routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const { createAchievement, getUserAchievements } = require('../controllers/achievementController');
const extractUser = require('../middleware/extractUser');

router.post('/', extractUser, createAchievement);
router.get('/user', extractUser, getUserAchievements);

module.exports = router;
