const express = require('express');
const { check, validationResult } = require('express-validator');
const extractUser = require('../middlewares/extractUser');
const tagController = require('../controllers/tagController');

const router = express.Router();

const validateTag = [
  check('name').notEmpty().withMessage('Nazwa tagu jest wymagana'),
  check('description').optional().isString(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/', extractUser, validateTag, validate, tagController.createTag);
router.get('/all', tagController.getTags);
router.get('/:id', tagController.getTagById);
router.put('/:id', extractUser, validateTag, validate, tagController.updateTag);
router.delete('/:id', extractUser, tagController.deleteTag);

module.exports = router;
