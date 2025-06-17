const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createAchievement = async (req, res) => {
  const { userId, name, description } = req.body;

  try {
    const exists = await prisma.achievement.findUnique({
      where: {
        userId_name: { userId, name },
      },
    });

    if (!exists) {
      const created = await prisma.achievement.create({
        data: { userId, name, description },
      });
      return res.status(201).json(created);
    }

    res.status(200).json({ message: 'Odznaka już istnieje' });
  } catch (err) {
    console.error('[createAchievement] Błąd:', err.message);
    res.status(500).json({ error: 'Nie udało się przyznać odznaki' });
  }
};
const getUserAchievements = async (req, res) => {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { keycloakId: req.user.keycloakId },
      });
  
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
  
      const achievements = await prisma.achievement.findMany({
        where: { userId: profile.id },
      });
  
      res.json(achievements);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
module.exports = {
  createAchievement,
  getUserAchievements,
};
