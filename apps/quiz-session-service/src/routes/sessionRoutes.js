const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionControllers');
const extractUser = require('../middlewares/extractUser');

router.post('/start/:quizId', extractUser, sessionController.startSession);
router.post('/:sessionId/answer', extractUser, sessionController.submitAnswer);
router.post('/:sessionId/pause', extractUser, sessionController.pauseSession);
router.post('/:sessionId/finish', extractUser, sessionController.finishSession);
router.get('/my', extractUser, sessionController.getUserSessions);
router.post('/:sessionId/resume', extractUser, sessionController.resumeSession);
router.get('/health', (req, res) => {
    res.send('user-service OK');
  });

module.exports = router;