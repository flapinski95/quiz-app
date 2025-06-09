const Quiz = require('../models/Quiz');

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

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;

    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    if (keywords) {
      const regex = new RegExp(keywords, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { tags: regex }
      ];
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
      .limit(parseInt(limit));

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
    console.log('[createQuiz] req.body:', req.body);
    const body = {
      ...req.body,
      createdBy: req.user.keycloakId,
    }
    console.log('[createQuiz] final body:', body);
    const quiz = new Quiz(body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
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
      sortBy = 'createdAt', 
      sortOrder = 'desc',  
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;
    if (keywords) {
      const regex = new RegExp(keywords, 'i'); 
      filter.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quizzes = await Quiz.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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