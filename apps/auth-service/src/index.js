const express = require('express');
const dotenv = require('dotenv');
const jwtMiddleware = require('./middleware/jwtCheck');
const profileRoutes = require('./routes/profileRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(jwtMiddleware); // zabezpiecza wszystkie trasy poniżej

app.use('/api/auth/profile', profileRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Auth service running on http://localhost:${port}`);
});