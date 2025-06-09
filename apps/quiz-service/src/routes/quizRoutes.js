const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
// const auth = require('../middlewares/auth');
const extractUser = require('../middlewares/extractUser');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', quizController.getAllQuizzes);
router.get('/my-quizzes', extractUser, quizController.getUserQuizzes);
router.get('/:id',  quizController.getQuizById);

router.post('/',extractUser, quizController.createQuiz);
router.get('/quizzes/search', quizController.searchQuizzes);

router.put('/:id', extractUser, quizController.updateQuiz);
router.delete('/:id', extractUser, quizController.deleteQuiz);
router.get('/health', (req, res) => {
    res.send('user-service OK');
  });


router.delete('/admin/:id', extractUser, isAdmin, quizController.deleteQuiz);



module.exports = router;