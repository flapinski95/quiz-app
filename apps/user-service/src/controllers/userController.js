const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

const getMyProfile = async (req, res) => {
  console.log('[getMyProfile] Szukanie profilu dla:', req.user.keycloakId);

  let user = await prisma.userProfile.findUnique({
    where: { keycloakId: req.user.keycloakId },
  });
  const achievements = await prisma.achievement.findMany({
    where: { userId: user.id },
  });

  if (!user) {
    console.log('[getMyProfile] Profil nie istnieje. Tworzę nowy...');
    try {
      const [newUser, achievement] = await prisma.$transaction([
        prisma.userProfile.create({
          data: {
            keycloakId: req.user.keycloakId,
            username: req.user.username || req.user.email?.split('@')[0] || 'anonymous',
            email: req.user.email || 'unknown@example.com',
            bio: '',
          },
        }),
        prisma.achievement.create({
          data: {
            name: 'Pierwsze logowanie',
            user: {
              connect: { keycloakId: req.user.keycloakId },
            },
          },
        }),
      ]);

      console.log('[getMyProfile] Nowy profil utworzony.');

      return res.json({
        ...newUser,
        stats: {
          totalQuizzesPlayed: newUser.totalQuizzesPlayed,
          totalScore: newUser.totalScore,
          averageScore: newUser.averageScore,
        },
        achievements
      });
    } catch (err) {
      console.error('[getMyProfile] Błąd tworzenia profilu:', err.message);
      return res
        .status(500)
        .json({ message: 'Nie udało się utworzyć profilu użytkownika', error: err.message });
    }
  } else {
    console.log('[getMyProfile] Profil znaleziony.');
    try {
      user = await prisma.userProfile.update({
        where: { keycloakId: req.user.keycloakId },
        data: {
          username: req.user.username || user.username,
          email: req.user.email || user.email,
        },
      });
    } catch (err) {
      console.error('[getMyProfile] Błąd aktualizacji profilu:', err.message);
    }
  }

  res.json({
    ...user,
    stats: {
      totalQuizzesPlayed: user.totalQuizzesPlayed,
      totalScore: user.totalScore,
      averageScore: user.averageScore,
    },
  });
};
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.userProfile.findMany({
      select: {
        keycloakId: true,
        username: true,
        email: true,
        bio: true,
        totalQuizzesPlayed: true,
        totalScore: true,
        averageScore: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(users);
  } catch (err) {
    console.error('[getAllUsers] Błąd:', err.message);
    res.status(500).json({ message: 'Nie udało się pobrać użytkowników', error: err.message });
  }
};
const updateStats = async (req, res) => {
  const { keycloakId } = req.params;
  const { newScore } = req.body;

  try {
    const user = await prisma.userProfile.findUnique({ where: { keycloakId } });

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    const totalQuizzesPlayed = user.totalQuizzesPlayed + 1;
    const totalScore = user.totalScore + newScore;
    const averageScore = totalScore / totalQuizzesPlayed;

    const updated = await prisma.userProfile.update({
      where: { keycloakId },
      data: { totalQuizzesPlayed, totalScore, averageScore },
    });

    res.json(updated);
  } catch (err) {
    console.error('[updateStats] Błąd:', err.message);
    res.status(500).json({ message: 'Nie udało się zaktualizować statystyk', error: err.message });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.keycloakId;
    const bio = req.body?.bio;

    console.log('[updateProfile] Start');
    console.log('[updateProfile] Header x-user-keycloakid:', req.headers['x-user-keycloakid']);
    console.log('[updateProfile] Wyciągnięty userId:', userId);
    console.log('[updateProfile] Bio:', bio);

    if (!userId) {
      console.warn('[updateProfile] Brak userId w req.user');
      return res.status(400).json({ error: 'Brak userId' });
    }

    if (!bio || typeof bio !== 'string') {
      console.warn('[updateProfile] Nieprawidłowe bio');
      return res.status(400).json({ error: 'Nieprawidłowe bio' });
    }

    const exists = await prisma.userProfile.findUnique({
      where: { keycloakId: userId },
    });

    if (!exists) {
      console.warn('[updateProfile] Profil nie istnieje dla:', userId);
      return res.status(404).json({ error: 'Profil nie istnieje' });
    }

    const profile = await prisma.userProfile.update({
      where: { keycloakId: userId },
      data: {
        bio: bio,
        updatedAt: new Date(),
      },
    });

    console.log('[updateProfile] Sukces. Zaktualizowany profil:', profile);

    res.json(profile);
  } catch (err) {
    console.error('[updateProfile] Błąd krytyczny:', err);
    res.status(500).json({ error: 'Błąd aktualizacji profilu', details: err.message });
  }
};
const createQuizHistory = async (req, res) => {
  const { userId, quizId, score, correctCount, totalCount, category } = req.body;

  if (
    !userId ||
    !quizId ||
    score === undefined ||
    correctCount === undefined ||
    totalCount === undefined
  ) {
    return res.status(400).json({ error: 'Brak wymaganych danych' });
  }

  try {
    const history = await prisma.userQuizHistory.create({
      data: {
        userId,
        quizId,
        score,
        category,
        correctCount,
        totalCount,
      },
    });

    res.status(201).json(history);
  } catch (err) {
    console.error('[createQuizHistory] Błąd:', err.message);
    res.status(500).json({ error: 'Nie udało się zapisać historii quizu', details: err.message });
  }
};
const getHistoryById = async (req, res) => {
  try {
    const history = await prisma.userQuizHistory.findMany({
      where: { userId: req.params.keycloakId },
      orderBy: { completedAt: 'desc' },
    });
    res.json(history);
  } catch (err) {
    console.error('[getHistory] Błąd:', err.message);
    res.status(500).json({ error: 'Nie udało się pobrać historii' });
  }
};
const getWeeklyRanking = async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    const ranking = await prisma.userQuizHistory.groupBy({
      by: ['userId'],
      where: {
        completedAt: {
          gte: oneWeekAgo,
        },
      },
      _sum: {
        score: true,
      },
      orderBy: {
        _sum: {
          score: 'desc',
        },
      },
      take: 10,
    });

    const users = await prisma.userProfile.findMany({
      where: {
        id: {
          in: ranking.map((r) => r.userId),
        },
      },
      select: {
        id: true,
        username: true,
        keycloakId: true,
      },
    });

    const result = ranking.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      return {
        userId: user?.keycloakId,
        username: user?.username,
        totalScore: r._sum.score,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('[getWeeklyRanking] Błąd:', err.message);
    res.status(500).json({ error: 'Nie udało się pobrać rankingu tygodniowego' });
  }
};
const getTopicRanking = async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Brak kategorii' });

  try {
    const ranking = await prisma.userQuizHistory.groupBy({
      by: ['userId'],
      where: {
        category: category,
      },
      _sum: {
        score: true,
      },
      orderBy: {
        _sum: {
          score: 'desc',
        },
      },
      take: 10,
    });

    const users = await prisma.userProfile.findMany({
      where: {
        id: { in: ranking.map((r) => r.userId) },
      },
      select: {
        id: true,
        username: true,
        keycloakId: true,
      },
    });

    const result = ranking.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      return {
        userId: user?.keycloakId,
        username: user?.username,
        totalScore: r._sum.score,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('[getTopicRanking] Błąd:', err.message);
    res.status(500).json({ error: 'Nie udało się pobrać rankingu tematycznego' });
  }
};
const inviteToQuiz = async (req, res) => {
  const { userId, quizId } = req.params;
  const requesterId = req.user.keycloakId;

  try {
    const quizRes = await axios.get(`http://quiz-service:3003/invite/${quizId}`, {
      headers: {
        'x-user-keycloakid': requesterId,
      },
    });

    const quiz = quizRes.data;

    if (!quiz) {
      return res.status(404).json({ error: 'Nie znaleziono quizu' });
    }

    if (quiz.createdBy !== requesterId) {
      return res.status(403).json({ error: 'Nie jesteś właścicielem tego quizu' });
    }

    const updated = await prisma.userProfile.update({
      where: { keycloakId: userId },
      data: {
        invitations: {
          push: quizId,
        },
      },
    });
    await axios.patch(
      `http://quiz-service:3003/invite/${quizId}/user`,
      { userId },
      { headers: { 'x-user-keycloakid': requesterId } },
    );

    res.status(200).json({ message: 'Dodano zaproszenie', invitations: updated.invitations });
  } catch (err) {
    console.error('[inviteToQuiz]', err.message);
    res.status(500).json({ error: 'Nie udało się zaprosić', details: err.message });
  }
};

const getInvitations = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { invitations: true },
    });

    if (!user) return res.status(404).json({ error: 'Nie znaleziono usera' });

    res.json(user.invitations);
  } catch (err) {
    res.status(500).json({ error: 'Nie udało się pobrać', details: err.message });
  }
};
const getMyInvitations = async (req, res) => {
  try {
    const user = await prisma.userProfile.findUnique({
      where: { keycloakId: req.user.keycloakId },
      select: { invitations: true },
    });
    if (!user) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });

    res.json(user.invitations);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania zaproszeń', details: err.message });
  }
};

module.exports = {
  getMyInvitations,
  getHistoryById,
  getAllUsers,
  updateProfile,
  updateStats,
  getMyProfile,
  createQuizHistory,
  getWeeklyRanking,
  getTopicRanking,
  inviteToQuiz,
  getInvitations,
};
