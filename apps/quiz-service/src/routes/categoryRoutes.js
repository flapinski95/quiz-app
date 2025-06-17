const express = require('express');
const { check, validationResult } = require('express-validator');
const extractUser = require('../middlewares/extractUser');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

const validateCategory = [
  check('name').notEmpty().withMessage('Nazwa kategorii jest wymagana'),
  check('description').optional().isString(),
  check('parent').optional().isMongoId().withMessage('Nieprawidłowy ID kategorii nadrzędnej'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/', extractUser, validateCategory, validate, categoryController.createCategory);
router.get('/all', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', extractUser, validateCategory, validate, categoryController.updateCategory);
router.delete('/:id', extractUser, categoryController.deleteCategory);

module.exports = router;
