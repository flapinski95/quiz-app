// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateStats,
  updateProfile,
  getAllUsers,
  createQuizHistory,
  getHistoryById,
  getWeeklyRanking,
  getTopicRanking,
  getInvitations,
  getMyInvitations,
  inviteToQuiz,
} = require('../controllers/userController');
const extractUser = require('../middleware/extractUser');
const verifyInternalRequest = require('../middleware/verifyInternalRequest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/me', extractUser, getMyProfile);
router.put('/me', extractUser, updateProfile);
router.get('/all', extractUser, getAllUsers);

router.get('/health', (req, res) => {
  res.send('OK');
});
router.patch('/stats/:keycloakId', updateStats);
router.patch('/stats/:keycloakId', updateStats);
router.delete('/internal/users/:id', verifyInternalRequest, async (req, res) => {
  const id = req.params.id;

  try {
    await prisma.userProfile.delete({
      where: { keycloakId: id },
    });
    res.json({ message: 'Użytkownik usunięty z bazy' });
  } catch (err) {
    console.error('[user-service] Błąd:', err.message);
    res.status(500).json({ error: 'Nie udało się usunąć użytkownika' });
  }
});
router.post('/history', createQuizHistory);
router.get('/history/:keycloakId', extractUser, getHistoryById);
router.get('/ranking/weekly', getWeeklyRanking);
router.get('/ranking/topic', getTopicRanking);
router.post('/invite/:quizId/:userId', extractUser, inviteToQuiz);
router.get('/invitations/me', extractUser, getMyInvitations);
router.get('/invitations/:userId', extractUser, getInvitations);


module.exports = router;
