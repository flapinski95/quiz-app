const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3002';

async function assignAchievements(session) {
  const achievements = [];

  const userSessionsRes = await axios.get(`${USER_SERVICE_URL}/history/${session.userId}`, {
    headers: { 'x-user-keycloakid': session.userId } 
  });
  const sessionCount = userSessionsRes.data.length;

  if (sessionCount === 1)
    achievements.push({
      name: 'Pierwszy quiz!',
      description: 'Rozwiązał swój pierwszy quiz.',
    });

  if (sessionCount === 10)
    achievements.push({
      name: '10 quizów!',
      description: 'Ukończył 10 quizów.',
    });

  const allCorrect = session.answers.length > 0 && session.answers.every((a) => a.isCorrect);
  if (allCorrect)
    achievements.push({
      name: 'Perfekcja!',
      description: '100% odpowiedzi poprawnych w quizie.',
    });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRes = await axios.get(
    `${USER_SERVICE_URL}/history/${session.userId}?from=${today.toISOString()}`, {
        headers: {
            'x-user-keycloakid': session.userId
        }
    }
  );
  if (todayRes.data.length === 5)
    achievements.push({
      name: 'Nałóg!',
      description: '5 quizów jednego dnia.',
    });

  if (session.score >= 20)
    achievements.push({
      name: 'Koń z punktami',
      description: 'Zdobył 20+ punktów w jednym quizie.',
    });

  const ratio = session.answers.filter((a) => a.isCorrect).length / session.answers.length;
  if (ratio >= 0.5 && ratio < 1.0)
    achievements.push({
      name: 'Dobrze ci idzie!',
      description: 'Ponad połowa odpowiedzi poprawnych.',
    });

  for (const ach of achievements) {
    try {
      await axios.post(`${USER_SERVICE_URL}/achievements`, {
        userId: session.userId,
        name: ach.name,
        description: ach.description,
      }, {
        headers: {
            'x-user-keycloakid': session.userId
        }
      });
    } catch (e) {
      if (e.response?.status === 409) continue; 
      console.error(`[Achievement] Nie udało się przyznać "${ach.name}":`, e.message);
    }
  }
}

module.exports = assignAchievements;
