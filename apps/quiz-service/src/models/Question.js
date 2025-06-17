const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  type: {
    type: String,
    enum: ['single-choice', 'multiple-choice', 'true-false', 'open-ended'],
    required: true,
  },
  text: { type: String, required: true },
  options: [String],
  correctAnswers: [String],
  points: { type: Number, default: 1 },
  hint: String,
});

module.exports = mongoose.model('Question', questionSchema);
