const express = require('express');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const extractUser = require('./middleware/extractUser');


const app = express();

const cors = require('cors');
app.use(express.json());
app.use(cors({ origin: true, credentials: true }))

app.use('/',extractUser, userRoutes); 



// zamiast app.use('/')
app.use((req, res, next) => {
  console.log(`[USER-SERVICE] ${req.method} ${req.originalUrl}`);
  next();
});


const PORT = process.env.PORT || 3002;
const prisma = new PrismaClient();

app.listen(PORT, '0.0.0.0', () =>
  console.log(`User service listening on port ${PORT}`)
);