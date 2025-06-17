const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const extractUser = require('../middlewares/extractUser');
const { check } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

router.post(
  '/groups',
  extractUser,
  [
    check('name').notEmpty().withMessage('Group name is required'),
    check('members').isArray().withMessage('Members must be an array'),
  ],
  validateRequest,
  groupController.createGroup,
);

router.patch(
  '/groups/:id/add',
  extractUser,
  [check('userId').notEmpty().withMessage('User ID to add is required')],
  validateRequest,
  groupController.addMember,
);

router.delete('/groups/:id/remove/:userId', extractUser, groupController.removeMember);

module.exports = router;
