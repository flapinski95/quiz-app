const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
// const auth = require('../middlewares/auth');
const extractUser = require('../middlewares/extractUser');
const { check } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

router.post(
  '/:quizId/questions',
  extractUser,
  [
    check('text').notEmpty().withMessage('Question text is required'),
    check('type')
      .isIn(['single-choice', 'multiple-choice', 'true-false', 'open-ended'])
      .withMessage('Invalid question type'),
    check('points').isNumeric().withMessage('Points must be a number'),
  ],
  validateRequest,
  questionController.addQuestionToQuiz,
);
router.get('/:quizId/questions', questionController.getQuestionsForQuiz);
router.delete('/questions/:id', extractUser, questionController.deleteQuestion);
router.get('/questions/:id', questionController.getQuestionById);
module.exports = router;
