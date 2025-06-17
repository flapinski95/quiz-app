const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: 'Nie udało się stworzyć kategorii', details: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Nie udało się pobrać kategorii', details: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Kategoria nie istnieje' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Złe ID', details: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Nie znaleziono kategorii' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Nie udało się zaktualizować', details: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Kategoria nie istnieje' });
    res.json({ message: 'Kategoria usunięta ' });
  } catch (err) {
    res.status(400).json({ error: 'Złe ID', details: err.message });
  }
};
