// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {getMyProfile, updateMyProfile, updateMyAvatar, getCloudinarySignature, syncUser} = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const extractUser = require('../middleware/extractUser');


router.get('/me',  getMyProfile);
router.put('/me',  updateMyProfile);
router.post('/me/avatar',  updateMyAvatar);
router.get('/avatar-signature', getCloudinarySignature);
router.get('/health', (req, res) => {
    res.send('user-service OK');
  });
// router.post('/sync',authenticate, syncUser); 

module.exports = router;