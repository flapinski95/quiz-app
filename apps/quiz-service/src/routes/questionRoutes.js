const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middlewares/auth');

router.post('/quizzes/:quizId/questions', questionController.addQuestionToQuiz);
router.get('/quizzes/:quizId/questions', questionController.getQuestionsForQuiz);
router.delete('/questions/:id', questionController.deleteQuestion);

module.exports = router;