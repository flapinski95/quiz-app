const Tag = require('../models/Tag');

exports.createTag = async (req, res) => {
  try {
    const tag = new Tag(req.body);
    await tag.save();
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ error: 'Nie udało się stworzyć tagu', details: err.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Nie udało się pobrać tagów', details: err.message });
  }
};

exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag nie istnieje' });
    res.json(tag);
  } catch (err) {
    res.status(400).json({ error: 'Zjebane ID', details: err.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tag) return res.status(404).json({ error: 'Nie znaleziono tagu' });
    res.json(tag);
  } catch (err) {
    res.status(400).json({ error: 'Nie udało się zaktualizować', details: err.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag nie istnieje' });
    res.json({ message: 'Tag wypierdolony' });
  } catch (err) {
    res.status(400).json({ error: 'Zjebane ID', details: err.message });
  }
};
