const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middlewares/auth');

router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);

router.post('/', quizController.createQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);
router.get('/quizzes/search', quizController.searchQuizzes);

module.exports = router;