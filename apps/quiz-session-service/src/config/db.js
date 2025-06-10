const mongoose = require('mongoose');
const fs = require('fs');

const mongoUri = process.env.QUIZ_SESSION_MONGO_URI

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected (quiz-session-service)');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;