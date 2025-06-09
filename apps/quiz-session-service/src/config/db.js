const mongoose = require('mongoose');
const fs = require('fs');

const mongoUri = process.env.MONGO_URI || fs.readFileSync('/run/secrets/quiz_session_mongo_uri', 'utf8').trim();

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