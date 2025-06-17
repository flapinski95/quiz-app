require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const quizRoutes = require('./routes/quizRoutes');
const connectDB = require('./config/db');
const questionRoutes = require('./routes/questionRoutes');
const groupRoutes = require('./routes/groupRoutes');
const tagRoutes = require('./routes/tagRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3004', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
connectDB();

app.use('', quizRoutes);
app.use('', questionRoutes);
app.use('', groupRoutes);
app.use('/tag', tagRoutes);
app.use('/category', categoryRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Quiz service running on port ${PORT}`));
