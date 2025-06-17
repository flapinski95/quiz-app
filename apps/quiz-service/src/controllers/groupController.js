const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  const { name, members } = req.body;
  const creatorId = req.user.keycloakId;

  try {
    const group = await Group.create({
      name,
      createdBy: creatorId,
      members: [
        { userId: creatorId, role: 'admin' },
        ...(members?.map((userId) => ({ userId, role: 'member' })) || []),
      ],
    });
    res.status(201).json(group);
  } catch (err) {
    console.error('[createGroup]', err.message);
    res.status(500).json({ error: 'Nie udało się utworzyć grupy' });
  }
};

exports.addMember = async (req, res) => {
  const groupId = req.params.id;
  const { userId } = req.body;
  const requesterId = req.user.keycloakId;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ error: 'Grupa nie istnieje' });

  const isAdmin = group.members.some((m) => m.userId === requesterId && m.role === 'admin');
  if (!isAdmin) return res.status(403).json({ error: 'Brak uprawnień' });

  if (group.members.some((m) => m.userId === userId)) {
    return res.status(400).json({ error: 'Użytkownik już jest w grupie' });
  }

  group.members.push({ userId, role: 'member' });
  await group.save();
  res.json(group);
};

exports.removeMember = async (req, res) => {
  const groupId = req.params.id;
  const userIdToRemove = req.params.userId;
  const requesterId = req.user.keycloakId;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ error: 'Grupa nie istnieje' });

  const isAdmin = group.members.some((m) => m.userId === requesterId && m.role === 'admin');
  if (!isAdmin) return res.status(403).json({ error: 'Brak uprawnień' });

  group.members = group.members.filter((m) => m.userId !== userIdToRemove);
  await group.save();
  res.json({ message: 'Użytkownik usunięty', group });
};
