const axios = require('axios');
const Session = require('../models/Session');

const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://quiz-service:3003';czyl

exports.startSession = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.keycloakId;

    const quizRes = await axios.get(`${QUIZ_SERVICE_URL}/api/quizzes/${quizId}`);
    const quiz = quizRes.data;

    const session = new Session({
      quizId,
      userId,
      status: 'in-progress',
      answers: [],
      startedAt: new Date()
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    console.error('[startSession] Błąd:', err.message);
    res.status(500).json({ message: 'Nie udało się rozpocząć sesji', error: err.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, selectedAnswers } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Sesja nie znaleziona' });

    if (session.status !== 'in-progress') {
      return res.status(400).json({ message: 'Sesja nie jest aktywna' });
    }

    const questionRes = await axios.get(`${QUIZ_SERVICE_URL}/api/questions/${questionId}`);
    const question = questionRes.data;

    const isCorrect = Array.isArray(question.correctAnswers)
      && Array.isArray(selectedAnswers)
      && selectedAnswers.length === question.correctAnswers.length
      && selectedAnswers.every(ans => question.correctAnswers.includes(ans));

    session.answers.push({
      questionId,
      selectedAnswers,
      isCorrect
    });

    session.score = (session.score || 0) + (isCorrect ? question.points || 1 : 0);
    await session.save();

    res.json({
      correct: isCorrect,
      currentScore: session.score,
      answeredQuestions: session.answers.length
    });
  } catch (err) {
    console.error('[submitAnswer] Błąd:', err.message);
    res.status(500).json({ message: 'Nie udało się zapisać odpowiedzi', error: err.message });
  }
};