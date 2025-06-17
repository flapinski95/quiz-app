const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

exports.addQuestionToQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    const question = new Question({ ...req.body, quizId });
    await question.save();

    await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: question._id },
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: 'Could not add question', details: err.message });
  }
};

exports.getQuestionsForQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    await Quiz.findByIdAndUpdate(question.quizId, {
      $pull: { questions: question._id },
    });

    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid question ID' });
  }
};
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Pytanie nie znalezione' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Błąd przy pobieraniu pytania', error: err.message });
  }
};
