const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
// const auth = require('../middlewares/auth');
const extractUser = require('../middlewares/extractUser');
const isAdmin = require('../middlewares/isAdmin');
const { check } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

router.post(
  '/',
  extractUser,
  [
    check('title').notEmpty().withMessage('Title is required'),
    check('category').notEmpty().withMessage('Category is required'),
    check('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be valid'),
    check('language').notEmpty().withMessage('Language is required'),
  ],
  validateRequest,
  quizController.createQuiz,
);

router.get('/', quizController.getAllQuizzes);
router.get('/my-quizzes', extractUser, quizController.getUserQuizzes);
router.get('/:id', quizController.getQuizById);
router.get('/health', (req, res) => {
    res.send("OK")
})

router.get('/quizzes/search', quizController.searchQuizzes);
router.post('/comment/:id', extractUser, quizController.addComment)

router.put('/:id', extractUser, quizController.updateQuiz);
router.delete('/:id', extractUser, quizController.deleteQuiz);
router.post('/:id/rate', extractUser, quizController.rateQuiz);

router.delete('/admin/:id', extractUser, isAdmin, quizController.deleteQuiz);
router.get('/invite/:id', extractUser, quizController.getQuiztoInvite);
router.patch('/invite/:quizId/user', extractUser, quizController.addInvitedUser);

router.patch('/quiz/:id/increment-playcount', quizController.incrementPlayCount);

module.exports = router;
