const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Category', categorySchema);
