const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middlewares/auth');
const extractUser = require('../middlewares/extractUser');

router.get('/', extractUser,quizController.getAllQuizzes);
router.get('/:id',extractUser,  quizController.getQuizById);

router.post('/',extractUser, quizController.createQuiz);
router.put('/:id', extractUser, quizController.updateQuiz);
router.delete('/:id', extractUser, quizController.deleteQuiz);
router.get('/quizzes/search', extractUser, quizController.searchQuizzes);

module.exports = router;