// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {getMyProfile, updateStats, updateProfile, getAllUsers} = require('../controllers/userController');
const extractUser = require('../middleware/extractUser');
const verifyInternalRequest = require('../middleware/verifyInternalRequest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 


router.get('/me',  extractUser, getMyProfile);
router.put('/me', extractUser, updateProfile);
router.get('/all', extractUser, getAllUsers)

router.get('/health', (req, res) => {
    res.send('user-service OK');
  });
router.patch('/stats/:keycloakId', updateStats);router.patch('/stats/:keycloakId', updateStats);
router.delete('/internal/users/:id', verifyInternalRequest, async (req, res) => {
  const id = req.params.id;

  try {
    await prisma.userProfile.delete({
      where: { keycloakId: id }
    });
    res.json({ message: 'Użytkownik usunięty z bazy' });
  } catch (err) {
    console.error('[user-service] Błąd:', err.message);
    res.status(500).json({ error: 'Nie udało się usunąć użytkownika' });
  }
});

module.exports = router;