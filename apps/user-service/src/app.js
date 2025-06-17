const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const userRoutes = require('./routes/userRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  }),
);

app.use('/', userRoutes);
app.use('/achievements', achievementRoutes);

app.use((req, res, next) => {
  console.log(`[USER-SERVICE] ${req.method} ${req.originalUrl}`);
  next();
});

module.exports = app;
