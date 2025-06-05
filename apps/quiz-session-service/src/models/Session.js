const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedAnswers: [String],
  isCorrect: Boolean,
});

const sessionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: String, required: true }, // keycloakId
  startedAt: { type: Date, default: Date.now },
  finishedAt: Date,
  status: {
    type: String,
    enum: ['in-progress', 'paused', 'finished'],
    default: 'in-progress',
  },
  currentQuestion: { type: Number, default: 0 },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
});

module.exports = mongoose.model('Session', sessionSchema);