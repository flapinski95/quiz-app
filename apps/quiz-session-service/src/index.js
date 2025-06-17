require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
connectDB();

app.use('/', sessionRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Quiz service running on port ${PORT}`));
