const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMyProfile = async (req, res) => {
  console.log('[getMyProfile] Szukanie profilu dla:', req.user.keycloakId);

  let user = await prisma.userProfile.findUnique({
    where: { keycloakId: req.user.keycloakId },
  });

  if (!user) {
    console.log('[getMyProfile] Profil nie istnieje. Tworzę nowy...');
    try {
      user = await prisma.userProfile.create({
        data: {
          keycloakId: req.user.keycloakId,
          bio: '',
          avatarUrl: '',
        },
      });
      console.log('[getMyProfile] Nowy profil utworzony.');
    } catch (err) {
      console.error('[getMyProfile] Błąd tworzenia profilu:', err.message);
      return res.status(500).json({ message: 'Nie udało się utworzyć profilu użytkownika', error: err.message });
    }
  } else {
    console.log('[getMyProfile] Profil znaleziony.');
  }

  res.json(user);
};

const updateMyProfile = async (req, res) => {
  console.log(req.body);
  const { bio, avatarUrl } = req.body;
  console.log('[updateMyProfile] Aktualizacja profilu:', { bio, avatarUrl });

  try {
    const updated = await prisma.userProfile.upsert({
      where: { keycloakId: req.user.keycloakId },
      update: { bio, avatarUrl },
      create: {
        keycloakId: req.user.keycloakId,
        bio,
        avatarUrl,
      },
    });
    console.log('[updateMyProfile] Profil zaktualizowany.');
    res.json(updated);
  } catch (err) {
    console.error('[updateMyProfile] Błąd:', err.message);
    res.status(500).json({ message: 'Nie udało się zaktualizować profilu', error: err.message });
  }
};

const updateMyAvatar = async (req, res) => {
  const { avatarUrl } = req.body;
  console.log('[updateMyAvatar] Aktualizacja awatara na:', avatarUrl);

  if (!avatarUrl) {
    console.warn('[updateMyAvatar] Brak avatarUrl w żądaniu.');
    return res.status(400).json({ message: 'Brak adresu URL awatara' });
  }

  try {
    const updated = await prisma.userProfile.update({
      where: { keycloakId: req.user.keycloakId },
      data: { avatarUrl },
    });
    console.log('[updateMyAvatar] Awatar zaktualizowany.');
    res.json(updated);
  } catch (err) {
    console.error('[updateMyAvatar] Błąd:', err.message);
    res.status(500).json({ message: 'Nie udało się zaktualizować awatara', error: err.message });
  }
};

const getCloudinarySignature = (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
  const payload = `timestamp=${timestamp}${cloudinarySecret}`;
  const signature = crypto.createHash('sha1').update(payload).digest('hex');

  console.log('[getCloudinarySignature] Wysłano sygnaturę dla Cloudinary');

  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  });
};
// controllers/syncUserController.js


const syncUser = async (req, res) => {
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

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMyAvatar,
  getCloudinarySignature,
  syncUser
};