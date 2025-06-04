// controllers/syncUserController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.syncUser = async (req, res) => {
  const { keycloakId} = req.body;

  if (!keycloakId) {
    return res.status(400).json({ message: 'Brakuje danych użytkownika' });
  }

  try {
    const user = await prisma.userProfile.upsert({
      where: { keycloakId },
      update: {},
      create: {
        keycloakId,
        bio: '',
        avatarUrl: '',
      },
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('Błąd przy syncUser:', err);
    res.status(500).json({ message: 'Nie udało się zapisać użytkownika w bazie' });
  }
};