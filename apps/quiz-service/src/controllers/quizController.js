const Quiz = require('../models/Quiz');
const Tag = require('../models/Tag');
const Category = require('../models/Category');
const axios = require('axios');
exports.getAllQuizzes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      language,
      tags,
      keywords,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.json({ total: 0, page: 1, limit: 10, quizzes: [] });
      }
    }

    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;

    if (tags) {
      const tagNames = tags.split(',').map((tag) => tag.trim());
      const tagDocs = await Tag.find({ name: { $in: tagNames } });
      const tagIds = tagDocs.map((tag) => tag._id);
      filter.tags = { $in: tagIds };
    }

    if (keywords) {
      const regex = new RegExp(keywords, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const sortOptions = {};
    const validSortFields = ['createdAt', 'views', 'playCount'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quizzes = await Quiz.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('tags')
      .populate('category');

    const total = await Quiz.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      quizzes,
    });
  } catch (err) {
    console.error('[getAllQuizzes]', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
exports.getUserQuizzes = async (req, res) => {
  try {
    const { keycloakId } = req.user;

    const quizzes = await Quiz.find({ createdBy: keycloakId }).sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    console.error('[getUserQuizzes]', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
exports.adminDeleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    res.json({ message: 'Quiz deleted by admin' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const body = {
      ...req.body,
      createdBy: req.user.keycloakId,
    };

    if (Array.isArray(body.tags)) {
      for (const tagName of body.tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = await Tag.create({ name: tagName, description: `Tag for ${tagName}` });
        }
      }
      const tagDocs = await Tag.find({ name: { $in: body.tags } });
      body.tags = tagDocs.map((t) => t._id);
    }

    if (body.category && typeof body.category === 'string') {
      let category = await Category.findOne({ name: body.category });
      if (!category) {
        category = await Category.create({
          name: body.category,
          description: `Category for ${body.category}`,
        });
      }
      body.category = category._id;
    }

    const quiz = new Quiz(body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.error('[createQuiz]', err);
    res.status(400).json({ error: 'Invalid data', details: err.message });
  }
};
exports.searchQuizzes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      language,
      keywords,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.json({ total: 0, page: 1, limit: 10, quizzes: [] });
      }
    }
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;
    if (tags) {
      const tagNames = tags.split(',').map((tag) => tag.trim());
      const tagDocs = await Tag.find({ name: { $in: tagNames } });
      const tagIds = tagDocs.map((tag) => tag._id);
      filter.tags = { $in: tagIds };
    }
    if (keywords) {
      const regex = new RegExp(keywords, 'i');
      const tagDocs = await Tag.find({ name: regex });
      const tagIds = tagDocs.map((tag) => tag._id);
      filter.$or = [{ title: regex }, { description: regex }, { tags: { $in: tagIds } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quizzes = await Quiz.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('tags')
      .populate('category');

    const total = await Quiz.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      quizzes,
    });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};
exports.getQuizById = async (req, res) => {
  const quizId = req.params.id;
  const userId = req.headers['x-user-keycloakid'];

  try {
    let quiz = await Quiz.findById(quizId).populate('questions').populate('groupAccess');

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (quiz.isPrivate) {
      const isOwner = quiz.createdBy === userId;

      let isInGroupAccess = false;
      if (quiz.groupAccess && quiz.groupAccess.members) {
        isInGroupAccess = quiz.groupAccess.members.some((m) => m.userId === userId);
      }

      let isInvited = false;
      try {
        const inviteRes = await axios.get(`http://user-service:3002/invitations/${userId}`, {
          headers: {
            'x-user-keycloakId': userId,
          },
        });
        isInvited = inviteRes.data.includes(quizId);
      } catch (err) {
        console.error('[getQuizById] Błąd sprawdzania zaproszenia:', err.message);
      }

      if (!isOwner && !isInGroupAccess && !isInvited) {
        return res.status(403).json({
          error: 'quiz_niepubliczny',
          message:
            'Ten quiz jest prywatny – potrzebujesz zaproszenia lub należeć do grupy z dostępem.',
        });
      }
    }

    quiz.views = (quiz.views || 0) + 1;
    await quiz.save();

    res.json(quiz);
  } catch (err) {
    console.error('[getQuizById]', err.message);
    res.status(400).json({ error: 'Invalid ID format' });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: 'Invalid update data' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const isOwner = req.user.keycloakId === quiz.createdBy;
    const isAdmin = req.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this quiz' });
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
};
exports.addComment = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.keycloakId;
    const username = req.user.username
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Komentarz jest wymagany' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Brakuje nagłówka x-user-username' });
    }

    const comment = {
      userId,
      username,
      text,
      createdAt: new Date(),
    };

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $push: { comments: comment } },
      { new: true },
    );

    if (!updatedQuiz) {
      return res.status(404).json({ error: 'Quiz nie istnieje' });
    }

    res.status(201).json({ message: 'Dodano komentarz', comment });
  } catch (err) {
    console.error('[addComment]', err);
    res.status(500).json({ error: 'Nie udało się dodać komentarza', details: err.message });
  }
};
exports.rateQuiz = async (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.keycloakId;
  const { value } = req.body;

  if (![1, 2, 3, 4, 5].includes(value)) {
    return res.status(400).json({ error: 'Ocena musi być między 1 a 5' });
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const existing = quiz.ratings.find((r) => r.userId === userId);
  if (existing) {
    existing.value = value;
  } else {
    quiz.ratings.push({ userId, value });
  }

  await quiz.save();
  res.json({ message: 'Ocena zapisana' });
};
exports.getQuiztoInvite = async (req, res) => {
  const quizId = req.params.id;
  const requester = req.user?.keycloakId;
  console.log(quizId);
  console.log(requester);

  if (!requester) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }

  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Nie znaleziono quizu' });
    }

    if (quiz.createdBy !== requester) {
      return res.status(403).json({ error: 'Brak dostępu do tego quizu' });
    }

    res.json(quiz);
  } catch (err) {
    console.error('[getQuiztoInvite]', err.message);
    res.status(500).json({ error: 'Błąd serwera', details: err.message });
  }
};

exports.addInvitedUser = async (req, res) => {
  const { quizId } = req.params;
  const { userId } = req.body;
  const requester = req.user?.keycloakId;

  if (!requester) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'Brak userId w body' });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Nie znaleziono quizu' });

    if (quiz.createdBy !== requester) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    if (!Array.isArray(quiz.invitedUsers)) {
      quiz.invitedUsers = [];
    }

    if (!quiz.invitedUsers.includes(userId)) {
      quiz.invitedUsers.push(userId);
      await quiz.save();
    }

    res
      .status(200)
      .json({ message: 'Użytkownik dodany do invitedUsers', invitedUsers: quiz.invitedUsers });
  } catch (err) {
    console.error('[addInvitedUser]', err.message);
    res.status(500).json({ error: 'Nie udało się dodać użytkownika', details: err.message });
  }
};
exports.incrementPlayCount = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz nie znaleziony' });

    quiz.playCount = (quiz.playCount || 0) + 1;
    await quiz.save();

    res.status(200).json({ message: 'Play count zwiększony', playCount: quiz.playCount });
  } catch (err) {
    console.error('[incrementPlayCount]', err.message);
    res.status(500).json({ message: 'Błąd przy zwiększaniu playCount', error: err.message });
  }
};
