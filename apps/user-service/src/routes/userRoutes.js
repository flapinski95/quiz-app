// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {getMyProfile, updateMyProfile, updateMyAvatar, getCloudinarySignature, syncUser} = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const extractUser = require('../middleware/extractUser');


router.get('/me',  extractUser, getMyProfile);
router.put('/me',  extractUser, updateMyProfile);
router.post('/me/avatar', extractUser,  updateMyAvatar);
router.get('/avatar-signature', extractUser, getCloudinarySignature);
router.get('/health', (req, res) => {
    res.send('user-service OK');
  });
// router.post('/sync',authenticate, syncUser); 

module.exports = router;