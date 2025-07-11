const axios = require('axios');
const Session = require('../models/Session');

const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://quiz-service:3003';
const assignAchievements = require('../utils/achievementChecker');

exports.startSession = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.keycloakId;

    const quizRes = await axios.get(`${QUIZ_SERVICE_URL}/${quizId}`);
    const quiz = quizRes.data;

    const session = new Session({
      quizId,
      userId,
      status: 'in-progress',
      answers: [],
      startedAt: new Date(),
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

    const questionRes = await axios.get(`${QUIZ_SERVICE_URL}/questions/${questionId}`);
    const question = questionRes.data;

    const isCorrect =
      Array.isArray(question.correctAnswers) &&
      Array.isArray(selectedAnswers) &&
      selectedAnswers.length === question.correctAnswers.length &&
      selectedAnswers.every((ans) => question.correctAnswers.includes(ans));

    session.answers.push({
      questionId,
      selectedAnswers,
      isCorrect,
    });

    session.score = (session.score || 0) + (isCorrect ? question.points || 1 : 0);
    await session.save();

    res.json({
      correct: isCorrect,
      currentScore: session.score,
      answeredQuestions: session.answers.length,
    });
  } catch (err) {
    console.error('[submitAnswer] Błąd:', err.message);
    res.status(500).json({ message: 'Nie udało się zapisać odpowiedzi', error: err.message });
  }
};
exports.pauseSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Sesja nie znaleziona' });

    if (session.status !== 'in-progress') {
      return res.status(400).json({ message: 'Nie można zatrzymać nieaktywnej sesji' });
    }

    session.status = 'paused';
    session.pausedAt = new Date();
    await session.save();

    res.json({ message: 'Sesja zatrzymana', session });
  } catch (err) {
    res.status(500).json({ message: 'Błąd przy zatrzymywaniu sesji', error: err.message });
  }
};
exports.finishSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Sesja nie znaleziona' });

    session.status = 'finished';
    session.finishedAt = new Date();
    await session.save();

    const quizRes = await axios.get(`${QUIZ_SERVICE_URL}/${session.quizId}`);
    const quiz = quizRes.data;

    let categoryName = null;
    if (quiz.category) {
      try {
        const categoryRes = await axios.get(`${QUIZ_SERVICE_URL}/category/${quiz.category}`);
        categoryName = categoryRes.data.name;
      } catch (err) {
        console.warn('[finishSession] Nie udało się pobrać nazwy kategorii:', err.message);
      }
    }

    await axios.patch(`http://quiz-service:3003/quiz/${session.quizId}/increment-playcount`);
    await axios.patch(`http://user-service:3002/stats/${session.userId}`, {
      newScore: session.score,
    });

    await axios.post('http://user-service:3002/history', {
      userId: session.userId,
      quizId: session.quizId,
      category: categoryName || 'nieznana', 
      score: session.score,
      correctCount: session.answers.filter((a) => a.isCorrect).length,
      totalCount: session.answers.length,
    });

    await assignAchievements(session);

    res.json({
      message: 'Quiz zakończony',
      totalScore: session.score,
      totalQuestions: session.answers.length,
      correctAnswers: session.answers.filter((a) => a.isCorrect).length,
    });
  } catch (err) {
    console.error('[finishSession]', err.message);
    res.status(500).json({ message: 'Błąd przy zakończeniu sesji', error: err.message });
  }
};
exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.keycloakId }).sort({ startedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Nie udało się pobrać sesji', error: err.message });
  }
};
exports.resumeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Sesja nie znaleziona' });

    if (session.status !== 'paused') {
      return res.status(400).json({ message: 'Sesję można wznowić tylko ze stanu paused' });
    }

    session.status = 'in-progress';
    session.resumedAt = new Date();
    await session.save();

    res.json({ message: 'Sesja wznowiona', session });
  } catch (err) {
    res.status(500).json({ message: 'Błąd przy wznawianiu sesji', error: err.message });
  }
};
