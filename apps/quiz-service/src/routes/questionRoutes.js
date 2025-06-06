const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middlewares/auth');
const extractUser = require('../middlewares/extractUser');


router.post('/:quizId/questions', extractUser, questionController.addQuestionToQuiz);
router.get('/:quizId/questions', extractUser, questionController.getQuestionsForQuiz);
router.delete('/questions/:id', extractUser, questionController.deleteQuestion);

module.exports = router;